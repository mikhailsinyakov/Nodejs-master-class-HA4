const app = {};

app.config = {
    sessionToken: null,
    currentPage: null,
    pagesForAllUsers: ['index', 'accountCreate', 'sessionCreate']
};

app.getCurrentPageName = () => {
    let bodyId = document.querySelector('body').id;
    if (typeof bodyId == 'string' && bodyId.length > 0) {
        app.config.currentPage = bodyId;
    }
};

// Get the token object from localStorage
app.getToken = () => {
    let token;
    try {
        token = JSON.parse(localStorage.getItem('token'));
    } catch(e) {
        token = null;
    }
    if (!token) {
        app.showNeededNavItems('loggedOut');
        if (!app.config.pagesForAllUsers.includes(app.config.currentPage)) {
            window.location = '/';
        }
    } else {
        app.showNeededNavItems('loggedIn');
        app.renewalToken();
    }
    app.config.sessionToken = token;
    

};

// Show navigation items only if they contain specified status of page in the class list or don't contain any classes (like home item)
app.showNeededNavItems = statusOfPage => {
    const menuItems = Array.from(document.querySelectorAll('nav li'));

    menuItems.forEach(item => {
        if (item.classList.contains(statusOfPage)) {
            item.style.display = 'inline-block';
        } else if (item.classList.length) {
            item.style.display = 'none';
        }
    });

};

app.client = {};

app.client.request = (headers, path, method, queryStringObject, payload) => {
    headers = typeof headers == 'object' ? headers : {};
    path = typeof path == 'string' ? path + '?' : '?';
    method = typeof method == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].includes(method) ? method : 'GET';
    queryStringObject = typeof queryStringObject == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof payload == 'object' && payload !== null ? payload : {};

    const xhr = new XMLHttpRequest();

    let count = 0;
    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            count++;
            if (count > 1) {
                path += '&';
            }
            path += `${queryKey}=${queryStringObject[queryKey]}`;
        }
    }

    xhr.open(method, path, true);

    xhr.setRequestHeader('Content-Type', 'application/json');

    if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.tokenId);
    }

    for (let headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    xhr.send(JSON.stringify(payload));

    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                const statusCode = xhr.status;
                let responsePayload;
                try {
                    responsePayload = JSON.parse(xhr.responseText);
                } catch(e) {
                    responsePayload = {};
                };
                resolve({ statusCode, responsePayload });
            }
        };
        xhr.onerror = () => {
            reject(Error('Error occurred during AJAX request'));
        };
    });

};

// When the form has been submit, send the request via AJAX
app.bindForms = () => {
    const allForms = Array.from(document.querySelectorAll('form'));
    allForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const path = this.action;
            let method = this.method.toUpperCase();
            let queryStringObject = {};
            let requestPayload = {};
            const elements = Array.from(this.elements);
            elements.forEach(element => {
                if (element.name == '_method') {
                    method = element.value;
                } else {
                    requestPayload[element.name] = element.value;
                }
            });
            if (method == 'DELETE') {
                queryStringObject = { ...requestPayload };
                requestPayload = {};
            }
            
            app.client.request(undefined, path, method, queryStringObject, requestPayload)
                .then(response => {
                    const { statusCode, responsePayload } = response;
                    app.processFormSubmission(this.id, requestPayload, statusCode, responsePayload);
                }).catch(console.error);
        });
    });
};

app.processFormSubmission = (formId, requestPayload, statusCode, responsePayload) => {
    if (statusCode != 200) {
        app.showOrHideFormError(formId, true, responsePayload.Error);
        return;
    } 

    app.showOrHideFormError(formId, false);
    
    if (formId == 'accountCreateForm') {
        // Create a new token
        const { email, password } = requestPayload;
        const payload = { email, password };
        app.client.request(undefined, '/api/tokens', 'POST', undefined, payload)
            .then(response => {
                const { statusCode, responsePayload: anotherResponsePayload } = response;
                if (statusCode != 200) {
                    app.showOrHideFormError(formId, true, anotherResponsePayload.Error);
                    return;
                }
                app.successLogin(anotherResponsePayload);
            }).catch(console.error);
    }

    if (formId == 'sessionCreateForm') {
        app.successLogin(responsePayload);
    }
};

// Created token successfully
app.successLogin = tokenObject => {

    // Save the tokenObject in localStorage
    const tokenObjectString = JSON.stringify(tokenObject);
    localStorage.setItem('token', tokenObjectString);

    // Redirect to /menu
    window.location = '/menu';
};

app.renewalToken = () => {
    setInterval(() => {
        const { tokenId } = app.config.sessionToken;
        const payload = { id: tokenId };
        app.client.request(undefined, '/api/tokens', 'PUT', undefined, payload)
            .then(response => {
                const { statusCode, responsePayload } = response;
                if (statusCode != 200) {
                    console.log(responsePayload.Error);
                } else {
                    console.log('Token renewed successfully');
                }
            })
    }, 1000 * 60 * 5);
};

// Show or hide formError element
app.showOrHideFormError = (formId, toShow, error) => {
    const formError = document.querySelector(`#${formId} .formError`);
    if (toShow) {
        formError.style.display = 'block';
        formError.innerHTML = error;
    } else {
        formError.style.display = 'none';
        formError.innerHTML = '';
    }
};

// Actions when the contents of the pages is loaded
document.addEventListener('DOMContentLoaded', e => {
    app.getCurrentPageName();
    app.getToken();
    app.bindForms();
});