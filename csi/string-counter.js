//
// replace String with a version that counts the invocations
//
const rString = global.String;

class StringCounter {
  constructor ({context, log}) {
    this.context = context;
    this.log = log;
  }

  setStringToCounted () {
    const self = this;

    global.String = function () {
      let ctx = self.context.get(StringCounter.contextName);
      if (!ctx) {
        ctx = {objCalls: 0, strCalls: 0};
      } else if (!('strCalls' in ctx)) {
        self.log.warn('setting context in String');
        ctx.strCalls = 0;
        ctx.objCalls = 0;
      }

      if (new.target) {
        ctx.objCalls += 1;
        return Reflect.construct(rString, arguments, rString);
      } else {
        ctx.strCalls += 1;
        return Reflect.apply(rString, this, arguments);
      }
    }

    // copy static methods.
    Object.getOwnPropertyNames(rString).forEach(p => {
      if (typeof rString[p] === 'function') {
        global.String[p] = rString[p];
      }
    });
  }

  // get counters
  getStringCounts () {
    const ctx = this.context.get(StringCounter.contextName);
    if (!ctx) {
      this.log.debug('getStringCounts: no context');
      return {strCalls: NaN, objCalls: NaN};
    }
    const o = {
      strCalls: ctx.strCalls || 0,
      objCalls: ctx.objCalls || 0,
    };
    return o;
  }

  // clear counters
  resetStringCounts () {
    const ctx = this.context.get();
    if (ctx) {
      ctx.strCalls = 0;
      ctx.objCalls = 0;
    }
  }

}

StringCounter.contextName = 'strings';
StringCounter.initialContext = function () {
  return Object.assign({}, {strCalls: 0, objCalls: 0});
}
// reset String to original. careful - this affects all string counters.
StringCounter.resetString = function () {
  global.String = rString;
}

module.exports = StringCounter;
