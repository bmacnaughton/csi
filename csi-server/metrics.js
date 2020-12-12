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
    // return object
    const o = {
      minMs: Infinity,
      maxMs: 0,
      minStrCalls: Infinity,
      maxStrCalls: 0,
      averageMs: 0,
      averageStrCalls: 0,
      requires: {
        builtin: {
          min: {
            patched: Infinity,
            unpatched: Infinity,
          },
          max: {
            patched: 0,
            unpatched: 0,
          }
        },
        installed: {
          min: {
            patched: Infinity,
            unpatched: Infinity,
          },
          max: {
            patched: 0,
            unpatched: 0,
          }
        },
        relative: {
          min: {
            patched: Infinity,
            unpatched: Infinity,
          },
          max: {
            patched: 0,
            unpatched: 0,
          }
        },
      }

    };
    let n = 0;
    let totMs = 0;
    let totStrCalls = 0;
    for (const v of db.values()) {
      if (v.et < o.minMs) o.minMs = v.et;
      if (v.et > o.maxMs) o.maxMs = v.et;

      const s = v.deltaStrings;
      // count both string objects and string conversions.
      const tot = s.strCalls + s.objCalls;
      if (tot < o.minStrCalls) o.minStrCalls = tot;
      if (tot > o.maxStrCalls) o.maxStrCalls = tot;

      const r = v.deltaRequires;
      for (const k in r) {
        if (r[k].patched < o.requires[k].min.patched) o.requires[k].min.patched = r[k].patched;
        if (r[k].patched > o.requires[k].max.patched) o.requires[k].max.patched = r[k].patched;
        if (r[k].unpatched < o.requires[k].min.unpatched) o.requires[k].min.unpatched = r[k].unpatched;
        if (r[k].unpatched > o.requires[k].max.unpatched) o.requires[k].max.unpatched = r[k].unpatched;
      }

      n += 1;
      totMs += v.et;
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
