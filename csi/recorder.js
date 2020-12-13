//
// record metrics to configured destinations: console, http endpoint, file.
//

const crypto = require('crypto');

const request = require('superagent');

let output;
let endpoint;
let file;         // currently open log file or null.

module.exports = {
  //
  // record metrics to configured destinations
  //
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
      file.write(`${new Date().toISOString()} ${JSON.stringify(data)}\n`);
    }

    // don't care if the writes fail; just return the id.
    return Promise.all(promises).then(results => id);
  },

  //
  // configure destinations for recording
  //
  setOptions (options) {
    if ('output' in options) {
      output = options.output;
    }
    if ('endpoint' in options) {
      endpoint = options.endpoint;
    }
    if ('logFile' in options) {
      // allow falsey logFile to just close existing file.
      if (file) {
        file.close()
      }
      // but if not falsey open a new file.
      if (options.logFile) {
        const fs = require('fs');
        file = fs.createWriteStream(options.logFile);
      }
    }
  }

}
