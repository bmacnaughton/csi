const crypto = require('crypto');

const request = require('superagent');

let output = console.log;
let endpoint;
let logFile;      // specification of file
let file;         // currently open file.

module.exports = {
  async record (metrics) {
    // url safe base 64
    const id = crypto.randomBytes(30).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const data = {id, metrics};
    if (output) {
      output(JSON.stringify(data));
    }
    const promises = [];
    if (endpoint) {
      const res = request
        .post(endpoint)
        .send(data)
        .set('content-type', 'application/json')
        .set('accept', 'application/json')
        .then(res => {
          return res;
        })
        .catch(e => e);
      promises.push(res);
    }
    if (file) {
      // handle write to log file
    }

    // don't care if the writes fail; just return the id.
    return Promise.all(promises).then(results => id);
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
