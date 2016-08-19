const lo = require('lodash');
const fs = require('fs');
const path = require('path');

const ex = (p) => p.then(console.log).catch(console.error);
const repl = require('repl').start({prompt: 'λ '});
const _context = repl.context;
const scope = require('lexical-scope')(fs.readFileSync(__filename));

for (var name in scope.locals[''] )
_context[scope.locals[''][name]] = eval(scope.locals[''][name]);

for (name in scope.globals.exported)
_context[scope.globals.exported[name]] = eval(scope.globals.exported[name]);

require('repl.history')(
  repl,
  `${process.env.HOME}/repo/js-repl/history/${path.basename(__filename)}`
);
