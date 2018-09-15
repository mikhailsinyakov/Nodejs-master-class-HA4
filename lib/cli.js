/*
 * Command Line Interface
 * 
 */

// Dependencies
const readline = require('readline');
const events = require('events');
class _events extends events {};
const e = new _events();
const os = require('os');
const v8 = require('v8');
const _data = require('./data');

// Instantiate the object
const cli = {};

// List of listener functions

// In the first 4 listeners, the catch method is not needed, because of the synchronous operation
e.on('man', (input, _interface) => {
    cli.responders.help()
        .then(() => _interface.prompt());
});

e.on('help', (input, _interface) => {
    cli.responders.help()
        .then(() => _interface.prompt())
});

e.on('exit', (input, _interface) => {
    cli.responders.exit()
        .then(() => _interface.prompt())
});

e.on('stats', (input, _interface) => {
    cli.responders.stats()
        .then(() => _interface.prompt())
});

// In case success or failure operation, call the prompt method of _interface object
e.on('list menu items', (input, _interface) => {
    cli.responders.listMenuItems()
        .then(() => _interface.prompt())
        .catch(() => _interface.prompt());
});

e.on('list orders', (input, _interface) => {
    cli.responders.listOrders(input)
        .then(() => _interface.prompt())
        .catch(() => _interface.prompt());
});

e.on('more order info', (input, _interface) => {
    cli.responders.moreOrderInfo(input)
        .then(() => _interface.prompt())
        .catch(() => _interface.prompt());
});

e.on('list users', (input, _interface) => {
    cli.responders.listUsers(input)
        .then(() => _interface.prompt())
        .catch(() => _interface.prompt());
});

e.on('more user info', (input, _interface) => {
    cli.responders.moreUserInfo(input)
        .then(() => _interface.prompt())
        .catch(() => _interface.prompt());
});

e.on('unsupported command', (input, _interface) => {
    cli.responders.unsupportedCommand()
        .then(() => _interface.prompt())
        .catch(() => _interface.prompt());
});

// List of the helper functions for adding lines to the console
cli.verticalSpace = rows => {
    rows = typeof rows == 'number' && rows > 0 && rows % 1 == 0 ? rows : 1;

    for (let i = 0; i < rows; i++) {
        console.log('');
    }
};

cli.centered = str => {
    str = typeof str == 'string' && str.length > 0 ? str : '';

    const width = process.stdout.columns;
    const leftPadding = Math.floor((width - str.length) / 2);
    let line = '';
    for (let i = 0; i < leftPadding; i++) {
        line += ' ';
    }
    line += str;
    console.log(line);
};

cli.dashLine = () => {
    const width = process.stdout.columns;
    let line = '';
    for (let i = 0; i < width; i++) {
        line += '-';
    }
    console.log(line);
};

// Helper function, to determine recent period from the option argument
cli.determineRecentPeriod = input => {
    // Filter, in case of multiple spaces in the input
    const arr = input.split(' ').filter(val => val);

    let option = arr[arr.length - 1].includes('--') ? arr[arr.length - 1] : null;
    if (option) {
        // Get rid of -- prefix
        option = option.slice(2);
    } else {
        option = '1';
    }

    // Determine the period for which orders to show
    let recentPeriod;
    if (option) {
        if (option == 'all') {
            recentPeriod = 'all';
        } else {
            // If option is a number
            if (typeof +option == 'number' && !isNaN(+option) && +option > 0 && +option % 1 == 0) {
                recentPeriod = +option * 24 * 60 * 60 * 1000;
            } else {
                return null;
            }
        }
    } else {
        recentPeriod = 1;
    }

    return recentPeriod;
};

// List of objects, which send the message to the console
cli.responders = {};

cli.responders.help = () => {
    const commands = {
        'man': 'This command',
        'help': 'Alias for the "man" command',
        'exit': 'Kill the application',
        'stats': 'Get statistics of the system',
        'list menu items': 'Get a list of all current menu items',
        'list orders --{days}': 'Get a list of all recent orders in the system for the specified number of days, "--all" is for all the time (default to 1 day)',
        'more order info --{orderId}': 'Get details of the specified order',
        'list users --{days}': 'Get a list of users who have signed up for the specified number of days, "--all" is for all the time (default to 1 day)',
        'more user info --{userEmail}': 'Get details of the specified user'
    };

    cli.verticalSpace();
    cli.dashLine();
    cli.centered('CLI HELP');
    cli.dashLine();
    cli.verticalSpace();

    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            cli.verticalSpace();
            let line = `\x1b[33m${key}\x1b[0m`;
            const padding = 35 - key.length;
            for (let i = 0; i < padding; i++) {
                line += ' ';
            }
            line += commands[key];
            console.log(line);
        }
    }
    cli.verticalSpace();
    cli.dashLine();
    cli.verticalSpace();
    return Promise.resolve();
};

cli.responders.exit = () => {
    process.exit(0);
    return Promise.resolve();
};

cli.responders.stats = () => {
    const statistics = {
        'Username': os.userInfo().username,
        'CPU Count': os.cpus().length,
        'Free Memory': Math.floor(os.freemem() / 1024) + ' Mb',
        'Used Heap Size': Math.round(v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) + '%',
        'Malloced Memory': Math.floor(v8.getHeapStatistics().malloced_memory / 1024) + ' Mb',
        'Peak Malloced Memory': Math.floor(v8.getHeapStatistics().peak_malloced_memory / 1024) + ' Mb',
        'Uptime': Math.floor(os.uptime()) + ' seconds'
    };
    cli.verticalSpace();
    for (let key in statistics) {
        if (statistics.hasOwnProperty(key)) {
            cli.verticalSpace();
            let line = `${key}: ${statistics[key]}`;
            console.log(line);
        }
    }
    cli.verticalSpace();
    return Promise.resolve();
};

cli.responders.listMenuItems = () => {
    return _data.list('menu')
        .then(fileNames => {
            cli.verticalSpace(2);
            const promises = [];
            // For each menu item, add a line
            fileNames.forEach(fileName => {
                const promise = _data.read('menu', fileName);
                promises.push(promise);
                promise.then(menuObject => {
                    const { id, name, price } = menuObject;
                    const line = `ID: ${id} ${name} ($${price})`;
                    console.log(line);
                    cli.verticalSpace();
                });
            });
            return Promise.all(promises);
        });
};

cli.responders.listOrders = input => {
    const recentPeriod = cli.determineRecentPeriod(input);
    if (!recentPeriod) {
        const line = 'Incorrect option argument, if you want to receive the data for all the time, specify --all, if you want to receive the data for the specified period of days, specify --{number}';
        cli.verticalSpace();
        console.log(line);
        cli.verticalSpace();
        return Promise.resolve();
    }

    return _data.list('orders')
        .then(orderIds => {
            const promises = [];
            let resultIsShown = false;
            orderIds.forEach(orderId => {
                const promise = _data.read('orders', orderId);
                promises.push(promise);
                promise.then(orderData => {
                    const { orderId, receiptTime, sum, user: { email } } = orderData;
                    if (recentPeriod == 'all' || Date.now() - recentPeriod < receiptTime) {
                        // Add vertical space if there is at least one result
                        if (!resultIsShown) {
                            cli.verticalSpace(2);
                            resultIsShown = true;
                        }
                        const line = `ID: ${orderId} Email: ${email} Sum: ${sum}`;
                        console.log(line);
                        cli.verticalSpace();
                    }
                });
            });
            return Promise.all(promises);
        });
};

cli.responders.moreOrderInfo = input => {
    // Filter, in case of multiple spaces in the input
    const arr = input.split(' ').filter(val => val);

    let option = arr[arr.length - 1].includes('--') ? arr[arr.length - 1] : null;
    if (!option) {
        const line = 'You should specify option "--{orderId}"';
        cli.verticalSpace();
        console.log(line);
        cli.verticalSpace();
        return Promise.resolve();
    }

    const orderId = option.slice(2);

    return _data.read('orders', orderId)
        .then(orderData => {
            cli.verticalSpace();
            console.dir(orderData, { colors: true });
            cli.verticalSpace();
            return true;
        }).catch(e => {
            cli.verticalSpace();
            const line = 'Specified order does not exist';
            console.log(line);
            cli.verticalSpace();
            return true;
        });
};

cli.responders.listUsers = input => {
    const recentPeriod = cli.determineRecentPeriod(input);
    if (!recentPeriod) {
        const line = 'Incorrect option argument, if you want to receive the data for all the time, specify --all, if you want to receive the data for the specified period of days, specify --{number}';
        cli.verticalSpace();
        console.log(line);
        cli.verticalSpace();
        return Promise.resolve();
    }

    return _data.list('users')
        .then(userEmails => {
            const promises = [];
            let resultIsShown = false;
            userEmails.forEach(userEmail => {
                const promise = _data.read('users', userEmail);
                promises.push(promise);
                promise.then(userData => {
                    const { email, firstName, lastName, signupTime } = userData;
                    if (recentPeriod == 'all' || Date.now() - recentPeriod < signupTime) {
                        // Add vertical space if there is at least one result
                        if (!resultIsShown) {
                            cli.verticalSpace(2);
                            resultIsShown = true;
                        }
                        const line = `Email: ${email} ${firstName} ${lastName}`;
                        console.log(line);
                        cli.verticalSpace();
                    }
                });
            });
            return Promise.all(promises);
        });
};

cli.responders.moreUserInfo = input => {
    // Filter, in case of multiple spaces in the input
    const arr = input.split(' ').filter(val => val);

    let option = arr[arr.length - 1].includes('--') ? arr[arr.length - 1] : null;
    if (!option) {
        const line = 'You should specify option "--{userEmail}"';
        cli.verticalSpace();
        console.log(line);
        cli.verticalSpace();
        return Promise.resolve();
    }

    const userEmail = option.slice(2);

    return _data.read('users', userEmail)
        .then(userData => {
            delete userData.hashedPassword;
            cli.verticalSpace();
            console.dir(userData, { colors: true });
            cli.verticalSpace();
            return true;
        }).catch(e => {
            cli.verticalSpace();
            const line = 'Specified user does not exist';
            console.log(line);
            cli.verticalSpace();
            return true;
        });
};

cli.responders.unsupportedCommand = () => {
    cli.verticalSpace();
    console.log('This command is unsupported. Please, enter "man" or "help" to get a list of supported commands');
    cli.verticalSpace();
    return Promise.resolve();
};

// Check if the specified command is included in the command list
cli.checkCommandsList = (input, _interface) => {
    input = typeof input == 'string' && input.trim().length > 0 ? input.trim() : null;
    if (!input) {
        e.emit('unsupported command');
        return;
    }

    const supportedCommands = [
        'man',
        'help',
        'exit',
        'stats',
        'list menu items',
        'list orders',
        'more order info',
        'list users',
        'more user info'
    ];

    let commandMatched = false;
    supportedCommands.some(command => {
        // Choose input, that starts with a command and optionally has a parameter
        const regex = new RegExp(`\^${command}(\\s\+--\\S\+)\?`);
        const regexMatched = regex.exec(input);
        if (regexMatched && regexMatched[0] == input) {
            e.emit(command, input, _interface);
            commandMatched = true;
            return true;
        }
    });

    if (!commandMatched) {
        e.emit('unsupported command', input, _interface);
    }
};

// Init the script
cli.init = () => {
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });
    _interface.prompt();

    // Add listener when a user presses a Enter key
    _interface.on('line', input => {
        // Add _interface parameter, because in case of an async operation run, when operation is completed, a prompt method will be called
        cli.checkCommandsList(input, _interface);
    });
};

// Export the module
module.exports = cli;