const lo = require('lodash');
const fp = require('lodash/fp');

const secrets = require(`secrets/${APP_ENV}.json`);

if (require.main === module){

    (function() {

        const _context = require('repl').start({prompt: 'λ '}).context;
        const scope = require('lexical-scope')(require('fs').readFileSync(__filename));

        for (var name in scope.locals[''] )
            _context[scope.locals[''][name]] = eval(scope.locals[''][name]);

        for (name in scope.globals.exported)
            _context[scope.globals.exported[name]] = eval(scope.globals.exported[name]);

    })();

}
