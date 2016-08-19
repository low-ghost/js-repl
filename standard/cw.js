const lo = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');
const path = require('path');
const connectwiseApi = require('lib-connectwise');
const postgresApi = require('lib-db-postgres').default;
const redisApi = require('redis');

const {
  APP_ENV,
  REDIS_PORT_6379_TCP_ADDR: REDIS_HOST = 'localhost',
  C = true,
  S = true,
  R = false,
} = process.env;

const { global: {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASS,
  POSTGRES_DB,
  CONNECTWISE_CID,
  CONNECTWISE_USER,
  CONNECTWISE_PASS,
} } = require(`./secrets/${APP_ENV}.json`);

const redisInfo = {
  port: 6379,
  host: REDIS_HOST,
};

const connect = { c: C, s: S, r: R };

const cwEnv = lo.includes([ 'test', 'development' ], APP_ENV) ? 'test' : 'production';

Promise.all([
  connect.c && postgresApi(
    `postgres://${POSTGRES_USER}:${POSTGRES_PASS}@${POSTGRES_HOST}/${POSTGRES_DB}`,
    { logging: false }
  ),
  connect.s && connectwiseApi(CONNECTWISE_CID, CONNECTWISE_USER, CONNECTWISE_PASS, cwEnv),
  connect.r && redisApi.createClient(redisInfo.port, redisInfo.host),
]).then(([ sequelize, connectwise, redis ]) => {

  // So that both short and long forms are available
  const s = sequelize;
  const c = connectwise;
  const r = redis;

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

});
