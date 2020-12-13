// allow empty log settings to suppress all logging.
const envName = 'CSI_LOG_ITEMS';
const initial = envName in process.env ? process.env[envName] : 'error,warn';
const opts = {defaultLevels: initial, envName};


const debug = new (require('debug-custom'))('csi', opts);

const loggers = {
  error: debug.make('error'),
  warn: debug.make('warn'),
  info: debug.make('info'),
  debug: debug.make('debug'),
};

module.exports = {debug, loggers};
