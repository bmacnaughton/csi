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
    if (!db.size) {
      return {};
    }
    const o = {
      minMs: Infinity,
      maxMs: 0,
      minStrCalls: Infinity,
      maxStrCalls: 0,
      averageMs: 0,
      averageStrCalls: 0,
    };
    let n = 0;
    let totMs = 0;
    let totStrCalls = 0;
    for (const i of db.values()) {
      if (i.et < o.minMs) o.minMs = i.et;
      if (i.et > o.maxMs) o.maxMs = i.et;

      const tot = i.deltaCounts.strCalls + i.deltaCounts.objCalls;
      if (tot < o.minStrCalls) o.minStrCalls = tot;
      if (tot > o.maxStrCalls) o.maxStrCalls = tot;

      n += 1;
      totMs += i.et;
      totStrCalls += tot;
    }

    o.averageMs = totMs / n;
    o.averageStrCalls = totStrCalls / n;

    return o;
  },
  getAll () {
    const o = {};
    for (const [k, i] of db) {
      o[k] = i;
    }
    return o;
  },
  get (id) {
    if (!db.has(id)) {
      const e = new Error('id not found');
      e.status = 404;
      throw e;
    }
    return db.get(id);
  },
}
