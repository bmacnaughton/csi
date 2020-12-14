//
// this is the main csi module. it aggregates the csi components.
//
const ace = require('ace-context');

const patcher = require('./patch-via-require');
const recorder = require('./recorder');
const StringCounter = require('./string-counter');
const debug = require('./debug');

const log = {
  error: debug.make('error'),
  warn: debug.make('warn'),
  info: debug.make('info'),
  debug: debug.make('debug'),
};

// create context for async chaining.
const context = ace.createNamespace('csi-context');
// and initialize context dependent counters
context.init = function () {
  context.set(StringCounter.contextName, StringCounter.initialContext());
}

// make the context-aware string counter.
const sc = new StringCounter({context, log});

// and start counting strings
sc.setStringToCounted();

// send patch details (if they change) on an interval. the number of patched files
// can be large so don't send the detailed information on every request - required
// files are not request-specific in most situations. if there is an error sending
// don't increment the seq so it will be retried.
let lastSeq = -1;
let iid = setInterval(sendRequires, 10 * 1000);

function sendRequires () {
  const requires = patcher.getCounts();
  if (requires.seq > lastSeq) {
    log.debug(`requires interval popped seq: ${requires.seq} lastSeq: ${lastSeq}`);

    recorder.recordRequires(requires)
      .then(r => {
        // if the send was successful update the sequence
        if (!(r instanceof Error)) {
          log.info(r);
          lastSeq = requires.seq;
        } else {
          log.error(r.message);
        }
      })
      .catch(e => log.error(e.message));
  }
}

function clearIntervalSender () {
  clearInterval(iid);
  iid = undefined;
}

//
// metrics for getMetrics()
//
class Metrics {
  constructor () {
    this.startTime = Date.now();
    this.strings = sc.getStringCounts();
    this.requires = patcher.getCounts();
  }
}

//
// function to get metrics or calculate delta metrics.
//
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
  context,
  recorder,
  getMetrics: Metrics.getMetrics,
  resetString: StringCounter.resetString,
  log,
  debug,
  clearIntervalSender,
};
