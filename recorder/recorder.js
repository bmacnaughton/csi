const crypto = require('crypto');

let output = console.log;

module.exports = {
  record: function (et, sc) {
    const unique = crypto.randomBytes(30).toString('base64');
    output(JSON.stringify({
      contrast: {
        id: unique,
        et,
        sc,
      }
    }));
    return unique;
  }
}
