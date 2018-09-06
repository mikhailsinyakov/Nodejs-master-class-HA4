const app = {};

app.config = {
    sessionToken: null,
    currentPage: null,
    pagesForAllUsers: ['index', 'accountCreate', 'sessionCreate', 'sessionDeleted', 'accountDeleted']
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
        app.removeTokenAndRedirect('/');
    } else {
        app.config.sessionToken = token;

        const queryStringObject = { id: token.tokenId };
        app.client.request(undefined, '/api/tokens', 'GET', queryStringObject, undefined)
            .then(response => {
                const { statusCode, responsePayload } = response;
                if (statusCode != 200) {
                    app.removeTokenAndRedirect('/');
                    return;
                }
                app.showNeededNavItems('loggedIn');
                app.renewalToken();
            }).catch(e => app.removeTokenAndRedirect('/'));
        
    }
};

// Run app.removeTokenAndRedirect when logOutAnchor has been clicked
app.bindLogOutAnchor = () => {
    const logOutAnchor = document.querySelector('#logOut');
    if (logOutAnchor) {
        logOutAnchor.addEventListener('click', function(e) {
            e.preventDefault();
            app.removeTokenAndRedirect('session/deleted');
        });
    }
}

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
    const formSuccess = document.querySelector(`#${formId} .formSuccess`);

    app.showOrHideFormMessage(formId, false, false);
    if (formSuccess) {
        app.showOrHideFormMessage(formId, true, false);
    }

    if (statusCode != 200) {
        app.showOrHideFormMessage(formId, false, true, responsePayload.Error);
        return;
    } 

    if (formId == 'accountCreateForm') {
        // Create a new token
        const { email, password } = requestPayload;
        const payload = { email, password };
        app.client.request(undefined, '/api/tokens', 'POST', undefined, payload)
            .then(response => {
                const { statusCode, responsePayload: anotherResponsePayload } = response;
                if (statusCode != 200) {
                    app.showOrHideFormMessage(formId, false, true, anotherResponsePayload.Error);
                    return;
                }
                app.successLogin(anotherResponsePayload);
            }).catch(console.error);
    }

    if (formId == 'sessionCreateForm') {
        app.successLogin(responsePayload);
    }

    if (formId == 'accountEditForm1') {
        const successMessage = 'Your account data has been changed';
        app.showOrHideFormMessage(formId, true, true, successMessage);
    }

    if (formId == 'accountEditForm2') {
        const successMessage = 'Your password has been changed';
        app.showOrHideFormMessage(formId, true, true, successMessage);
    }

    if (formId == 'accountEditForm3') {
        app.removeTokenAndRedirect('/account/deleted');
    }
};


app.loadDataOnPage = () => {
    if (app.config.currentPage == 'accountEdit') {
        const token = app.config.sessionToken;
        if (!token) {
            app.removeTokenAndRedirect('/');
            return;
        }
        const queryStringObject = { email: token.email };
        app.client.request(undefined, '/api/users', 'GET', queryStringObject, undefined)
            .then(response => {
                const { statusCode, responsePayload } = response;
                if (statusCode != 200) {
                    app.removeTokenAndRedirect('/');
                    return;
                }
                app.fillFormFields(responsePayload);
            }).catch(console.error);
    } 
    if (app.config.currentPage == 'menu') {
        const token = app.config.sessionToken;
        if (!token) {
            app.removeTokenAndRedirect('/');
            return;
        }
        app.client.request(undefined, '/api/menu', 'GET', undefined, undefined)
            .then(response => {
                const { statusCode, responsePayload } = response;
                if (statusCode != 200) {
                    app.removeTokenAndRedirect('/');
                    return;
                }
                app.addMenuItems(responsePayload);
            }).catch(console.error);
    }
};

app.fillFormFields = data => {
    const allForms = Array.from(document.querySelectorAll('form'));
    allForms.forEach(form => {
        const elements = Array.from(form.elements);
        elements.forEach(element => {
            if (data[element.name]) {
                element.value = data[element.name];
            }
        });
    });
};

app.addMenuItems = data => {
    const container = document.querySelector('#menuItems');
    data.forEach(item => {
        const elem = document.createElement('div');
        elem.classList.add('menuItem');
        elem.dataset.id = item.id;

        const nameElem = document.createElement('div');
        nameElem.classList.add('itemName');
        nameElem.innerHTML = item.name;
        const descriptionElem = document.createElement('div');
        descriptionElem.classList.add('itemDescription');
        descriptionElem.innerHTML = item.description;
        const priceElem = document.createElement('div');
        priceElem.classList.add('itemPrice');
        priceElem.innerHTML = '$' + item.price.toFixed(2);

        elem.appendChild(nameElem);
        elem.appendChild(descriptionElem);
        elem.appendChild(priceElem);

        container.appendChild(elem);
    });
};

app.removeTokenAndRedirect = redirect => {
    localStorage.removeItem('token');
    app.config.sessionToken = null;
    if (redirect != '/') {
        window.location = redirect;
    }
    if (!app.config.pagesForAllUsers.includes(app.config.currentPage)) {
        if (redirect == '/') {
            window.location = redirect;
        }
    } else {
        app.showNeededNavItems('loggedOut');
    }
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
app.showOrHideFormMessage = (formId, success, toShow, message) => {
    const formMessage = success ? document.querySelector(`#${formId} .formSuccess`)
                                : document.querySelector(`#${formId} .formError`);
    if (toShow) {
        formMessage.style.display = 'block';
        formMessage.innerHTML = message;
    } else {
        formMessage.style.display = 'none';
        formMessage.innerHTML = '';
    }
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

// Actions when the contents of the pages is loaded
document.addEventListener('DOMContentLoaded', e => {
    app.getCurrentPageName();
    app.getToken();
    app.bindLogOutAnchor();
    app.bindForms();
    app.loadDataOnPage();
});