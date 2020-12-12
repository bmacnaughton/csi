
const patcher = require('./patch-via-require');
const recorder = require('./recorder');
const getStringCounts = require('./string-counter');
const debug = require('./debug');

const log = {
  error: debug.make('error'),
  warn: debug.make('warn'),
  info: debug.make('info'),
  debug: debug.make('debug'),
};

class Metrics {
  constructor () {
    this.startTime = Date.now();
    this.strings = getStringCounts();
    this.requires = patcher.getCounts();
  }
}

Metrics.getMetrics = function (startMetrics) {
  if (!startMetrics) {
    return new Metrics();
  }

  if (!(startMetrics instanceof Metrics)) {
    throw new Error('start metrics must be an instance of Metrics');
  }

  // starting metrics are supplied so calculate delta values
  const {startTime: now, strings, requires} = new Metrics();
  const et = now - startMetrics.startTime;

  const deltaStrings = {
    strCalls: strings.strCalls - startMetrics.strings.strCalls,
    objCalls: strings.objCalls - startMetrics.strings.objCalls,
  };

  const deltaRequires = {};
  for (const k of ['builtin', 'installed', 'relative']) {
    deltaRequires[k] = {
      patched: requires[k].patched - startMetrics.requires[k].patched,
      unpatched: requires[k].unpatched - startMetrics.requires[k].unpatched,
    };
    // only add the items if they changed.
    if (deltaRequires[k].patched) {
      deltaRequires[k].patchedItems = requires[k].patchedItems;
    }
    if (deltaRequires[k].unpatched) {
      deltaRequires[k].unpatchedItems = requires[k].unpatchedItems;
    }
  }

  const metrics = {
    startTime: startMetrics.startTime, et, deltaStrings, deltaRequires};

  return metrics;
}

module.exports = {
  patcher,
  recorder,
  getMetrics: Metrics.getMetrics,
  log,
};
