// allow empty log settings to suppress all logging.
const envName = 'CSI_LOG_ITEMS';
const initial = envName in process.env ? process.env[envName] : 'error,warn';
const opts = {defaultLevels: initial, envName};

module.exports = new (require('debug-custom'))('csi', opts);