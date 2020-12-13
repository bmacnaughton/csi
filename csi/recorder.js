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
  // record request metrics to configured destinations
  //
  async recordRequest (metrics) {
    // url safe base 64
    const id = crypto.randomBytes(30).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const data = {type: 'request', id, metrics};

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
  // record require metrics
  //
  async recordRequires (requires) {
    const d = new Date();
    const time = d.getTime();
    const data = {type: 'requires', time, ht: d.toISOString(), requires};

    let stringified;
    if (output) {
      stringified = JSON.stringify(data);
      output(stringified);
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
      file.write(`${new Date().toISOString()} ${stringified || JSON.stringify(data)}\n`);
    }

    return Promise.all(promises).then(results => time);
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
