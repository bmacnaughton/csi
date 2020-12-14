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

    let promise;
    if (endpoint) {
      promise = request
        .post(endpoint)
        .send(data)
        .set('content-type', 'application/json')
        .set('accept', 'application/json')
        .then(res => {
          if (res.status !== 'OK') {
            return new Error(`server status: ${res.status}`);
          }
          return id;
        })
        .catch(e => e);
    } else {
      // if there is no endpoint just return an invalid id.
      promise = Promise.resolve('no-id');
    }
    if (file) {
      file.write(`${new Date().toISOString()} ${JSON.stringify(data)}\n`);
    }

    // return an error or the id.
    return promise;
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

    let promise;
    if (endpoint) {
      promise = request
        .post(endpoint)
        .send(data)
        .set('content-type', 'application/json')
        .set('accept', 'application/json')
        .then(res => {
          if (res.status !== 200) {
            return new Error(`server status: ${res.status}`);
          }
          let message;
          if (!res.body) {
            message = 'missing response body';
          } else if (res.body.status !== 'OK') {
            message = `api status: ${res.body.status}`;
          } else {
            return time;
          }

          return new Error(message);
        })
        .catch(e => e);
    } else {
      // if no endpoint return an invalid time value.
      promise = Promise.resolve(-1);
    }

    if (file) {
      file.write(`${new Date().toISOString()} ${stringified || JSON.stringify(data)}\n`);
    }

    // return the time or an error, eventually.
    return promise;
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
