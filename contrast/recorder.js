const crypto = require('crypto');

const request = require('superagent');

let output = console.log;
let endpoint = 'localhost:4000';
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
      const res = await request
        .post(endpoint)
        .send({bruce: 'says', hi: 'to-you'})
        .set('content-type', 'application/json')
        .set('accept', 'application/json')
        .then(res => {
          console.log('got response', res);
          return res;
        })
        .catch(e => e);
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
