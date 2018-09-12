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

// Instantiate the object
const cli = {};

// List of listener functions
e.on('man', input => {
    cli.responders.help();
});

e.on('help', input => {
    cli.responders.help();
});

e.on('exit', input => {
    cli.responders.exit();
});

e.on('stats', input => {
    cli.responders.stats();
});

e.on('list menu items', input => {
    cli.responders.listMenuItems();
});

e.on('list orders', input => {
    cli.responders.listOrders(input);
});

e.on('more order info', input => {
    cli.responders.moreOrderInfo(input);
});

e.on('list users', input => {
    cli.responders.listUsers(input);
});

e.on('more user info', input => {
    cli.responders.moreUserInfo(input);
});

e.on('unsupported command', input => {
    cli.responders.unsupportedCommand();
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
};

cli.responders.exit = () => {
    process.exit(0);
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
};

cli.responders.listMenuItems = () => {

};

cli.responders.listOrders = input => {

};

cli.responders.moreOrderInfo = input => {

};

cli.responders.listUsers = input => {

};

cli.responders.moreUserInfo = input => {

};

cli.responders.unsupportedCommand = () => {
    cli.verticalSpace();
    console.log('This command is unsupported. Please, enter "man" or "help" to get a list of supported commands');
    cli.verticalSpace();
};

// Check if the specified command is included in the command list
cli.checkCommandsList = input => {
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
        const regex = new RegExp(`\^${command}(\\s\+--\\w\+)\*`);
        const regexMatched = regex.exec(input);
        if (regexMatched && regexMatched[0] == input) {
            e.emit(command, input);
            commandMatched = true;
            return true;
        }
    });

    if (!commandMatched) {
        e.emit('unsupported command');
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
        cli.checkCommandsList(input);
        _interface.prompt();
    });
};

// Export the module
module.exports = cli;