const crypto = require('crypto');

let output = console.log;
let endpoint;
let logFile;      // specification of file
let file;         // currently open file.

module.exports = {
  async record (data) {
    const id = crypto.randomBytes(30).toString('base64');
    delete data.id;
    const contrast = Object.assign({id}, data);
    if (output) {
      output(JSON.stringify({contrast}));
    }
    if (endpoint) {
      // handle send to endpoint
    }
    if (file) {
      // handle write to log file
    }
    return id;
  },

  // config control
  setOptions (options) {
    if ('output' in options) {
      output = options.output;
    }
    if ('endpoint' in options) {
      endpoint = options.endpoint;
    }
    if ('logFile' in options) {
      // handle log file open/close, etc.
      logFile = options.logFile;
    }
  }

}
