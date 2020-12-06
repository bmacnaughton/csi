
const patcher = require('./patch-via-require');
const getStringCounts = require('./string-counter');
const debug = require('./debug');

const log = {
  error: debug.make('error'),
  warn: debug.make('warn'),
  info: debug.make('info'),
  debug: debug.make('debug'),
};

module.exports = {
  patcher,
  getStringCounts,
  log,
};
