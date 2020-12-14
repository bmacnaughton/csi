//
// instantiate the logger with the specified env var.
//

const envName = 'CSI_LOG_ITEMS';
// allow empty log settings to suppress all logging.
const initial = envName in process.env ? process.env[envName] : 'error,warn';
const opts = {defaultLevels: initial, envName};

module.exports = new (require('debug-custom'))('csi', opts);
