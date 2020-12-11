//
// handle metrics reported.
//
// report - add a new set of metrics to the store
// getSummary - calculate summary of metrics and return them
// get - fetch metrics for a specific ID
//
const db = new Map();

module.exports = {
  report (data) {
    if (!data.id) {
      const e = new Error('invalid metrics format');
      e.status = 422;
      throw e;
    }
    db.set(data.id, data.metrics);
  },
  getSummary () {
    const o = {};
    for (const [k, i] of db) {
      o[k] = i;
    }
    return o;
  },
  get (id) {
    console.log('ID', id);
    if (!db.has(id)) {
      const e = new Error('id not found');
      e.status = 404;
      throw e;
    }
    return db.get(id);
  },
}
