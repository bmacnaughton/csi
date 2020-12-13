const expect = require('chai').expect;

const {patcher, context, getMetrics, resetString, clearIntervalSender} = require('../csi/csi');

describe('unit tests', function () {
  // don't let test hang for interval timer.
  after(clearIntervalSender);

  describe('string objects metrics basics', function () {
    it('should count new string objects correctly', function () {
      context.run(function () {
        context.init();
        const {strings: initialCounts} = getMetrics();
        const n = random(100);
        for (let i = 0; i < n; i++) {
          new String(i);
        }
        const {strings: currentCounts} = getMetrics();
        expect(currentCounts.objCalls).equal(initialCounts.objCalls + n, `${n} string objects should be created`);
      }, {newContext: true});
    });

    it('should count string conversions correctly', function () {
      context.run(function () {
        context.init();
        const {strings: initialCounts} = getMetrics();
        const n = random(100);
        for (let i = 0; i < n; i++) {
          String(i);
        }
        const {strings: currentCounts} = getMetrics();
        expect(currentCounts.strCalls).equal(initialCounts.strCalls + n, `${n} string objects should be created`);
      }, {newContext: true});
    });
  });

  describe('verify independent string contexts', function () {
    it('should keep multiple contexts separate', function () {
      this.timeout(10000);
      const promises = [];
      const contexts = [
        {str: random(100), obj: random(100)},
        {str: random(100), obj: random(100)},
      ];

      for (let i = 0; i < contexts.length; i++) {
        const p = new Promise(resolve => {
          // run each in a separate context
          context.run(function () {
            context.init();
            const ctx = contexts[i];
            const initial = getMetrics();
            const tq = new TimerQueue();
            const p1 = new Promise(resolve => {
              let str = ctx.str;
              const createStr = function () {
                if (str > 0) {
                  str -= 1;
                  String(str);
                  tq.addTimer(range(5, 15), createStr);
                } else {
                  resolve();
                }
              };
              createStr();
            });
            const p2 = new Promise(resolve => {
              let obj = ctx.obj;
              const createObj = function () {
                if (obj > 0) {
                  obj -= 1;
                  new String(obj);
                  tq.addTimer(range(5, 15), createObj);
                } else {
                  resolve();
                }
              };
              createObj();
            });
            Promise.all([p1, p2]).then(() => {
              resolve(getMetrics(initial));
            });

          });
        });
        promises[i] = p;
      }

      return Promise.all(promises)
        .then(r => {
          for (let i = 0; i < contexts.length; i++) {
            const {deltaStrings: dStrings} = r[i];
            const ns = contexts[i].str;
            const no = contexts[i].obj;
            expect(dStrings.strCalls).equal(ns, `${ns} strings should be created in ${i}`);
            expect(dStrings.objCalls).equal(no, `${no} string objects should be created in ${i}`);
          }
        });
    });
  });

  describe('required file metrics basics', function () {
    let initial;
    let afterKoa;
    const reKoa = /node_modules\/koa\/lib\/application\.js$/;

    it('should get initial patch metrics', function () {
      initial = patcher.getCounts();
      expect(initial.errors).equal(0, 'no errors');
      expect(initial.builtin.patched).equal(0, 'no builtins should be patched');
      expect(initial.builtin.unpatched).equal(0, 'no builtins should be patched');
      expect(initial.installed.patched).equal(0, 'no installed modules should be patched');
      expect(initial.installed.unpatched).equal(0, 'no installed modules should be unpatched');
      expect(initial.relative.patched).equal(0, 'no relative references should be patched');
      expect(initial.relative.unpatched).equal(0, 'no relative references should be unpatched');

    });

    it('should enable patching and count correctly', function () {
      patcher.enable();
      require('koa');

      afterKoa = patcher.getCounts();
      expect(afterKoa.errors).equal(0, 'no errors');

      expect(afterKoa.builtin.patched).equal(0, 'no builtins should be patched');
      expect(afterKoa.builtin.unpatched).not.equal(0, 'there should be unpatched builtins');

      expect(afterKoa.installed.patched).equal(1, 'one installed module should be patched');
      expect(afterKoa.installed.unpatched).not.equal(0, 'there should be unpatched installed modules');

      expect(afterKoa.relative.patched).equal(0, 'no relative references should be patched');
      expect(afterKoa.relative.unpatched).not.equal(0, 'there should be unpatched relative references');

      expect(afterKoa.installed).property('patchedItems').an('array').length(1);
      expect(afterKoa.installed.patchedItems[0]).an('array').length(2);
      expect(afterKoa.installed.patchedItems[0][0]).match(reKoa);
      expect(afterKoa.installed.patchedItems[0][1]).equal(1);

      for (let i = 0; i < afterKoa.installed.unpatchedItems.length; i++) {
        const [name] = afterKoa.installed.unpatchedItems[i];
        expect(name).not.match(reKoa, 'koa should not appear in the unpatchedItems list');
      }
    });

    it('should count incremental requires', function () {
      require('koa');

      const final = patcher.getCounts();
      expect(final.errors).equal(0, 'no errors');

      expect(final.builtin.patched).equal(0, 'no builtins should be patched');
      expect(final.builtin.unpatched).not.equal(0, 'there should be unpatched builtins');

      expect(final.installed.patched).equal(1, 'one installed module should be patched');
      expect(final.installed.unpatched).not.equal(0, 'there should be unpatched installed modules');

      expect(final.relative.patched).equal(0, 'no relative references should be patched');
      expect(final.relative.unpatched).not.equal(0, 'there should be unpatched relative references');

      expect(final.installed).property('patchedItems').an('array').length(1);
      expect(final.installed.patchedItems[0]).an('array').length(2);
      expect(afterKoa.installed.patchedItems[0][0]).match(reKoa);
      expect(final.installed.patchedItems[0][1]).equal(1);

      let koaFound = false;
      let koaCount = 0;
      for (let i = 0; i < final.installed.unpatchedItems.length; i++) {
        const [name, count] = final.installed.unpatchedItems[i];
        if (name.match(reKoa)) {
          koaFound = true;
          koaCount = count;
          break;
        }
      }
      expect(koaFound).equal(true, 'koa should appear in the unpatchedItems list');
      expect(koaCount).equal(1, 'koa should have been unpatched exactly once');
    });

  });

  describe('calculate delta metrics', function () {
    it ('should correctly determine string deltas', function () {
      context.run(function () {
        context.init();
        const initial = getMetrics();

        const ns = random(100);
        const no = random(100);

        for (let i = 0; i < ns; i++) {
          String(i);
        }
        for (let i = 0; i < no; i++) {
          new String(i);
        }

        const {deltaStrings: dStrings} = getMetrics(initial);

        expect(dStrings.strCalls).equal(ns, `${ns} strings should be created`);
        expect(dStrings.objCalls).equal(no, `${no} string objects should be created`);

      }, {newContext: true});
    });

    // requires are not context-specific.
    it('should correctly determine require deltas', function () {
      const initial = getMetrics();

      require('crypto');      // require a builtin that this test hasn't required
      require('lodash');      // require a module that this test hasn't required
      require('../csi/csi');  // require a module that this test *has* required

      const n = random(100);
      for (let i = 0; i < n; i++) {
        String(i);
        new String(i);
      }
      const {deltaRequires: dRequires} = getMetrics(initial);

      expect(dRequires.builtin.patched).equal(0, 'no builtins should be patched');
      expect(dRequires.builtin.unpatched).not.equal(1, 'there should be one unpatched builtin');

      expect(dRequires.installed.patched).equal(0, 'no installeds should be patched');
      expect(dRequires.installed.unpatched).equal(1, 'there should be one unpatched installed');

      expect(dRequires.relative.patched).equal(0, 'no relatives should be patched');
      expect(dRequires.relative.unpatched).equal(1, 'there should be one unpatched relative');
    });
  });

  describe('verify restoring String works', function () {

    // string counters are context/transaction-specific.
    it('restoring String should stop string counting', function () {
      context.run(function () {
        context.init();
        const {strings: initialCounts} = getMetrics();
        resetString();

        const n = random(100);
        for (let i = 0; i < n; i++) {
          String(i);
          new String(i);
        }
        const {strings: currentCounts} = getMetrics();
        expect(currentCounts.strCalls).equal(0, 'strCalls should be equal to zero');
        expect(currentCounts.objCalls).equal(0, 'objCalls should be equal to zero');
        expect(currentCounts.strCalls).equal(initialCounts.strCalls, 'strCalls count should not change');
        expect(currentCounts.objCalls).equal(initialCounts.objCalls, 'objCalls count should not change');
      }, {newContext: true});
    });
  });
});


//
// helpers
//
function random (n) {
  return Math.round(Math.random() * n);
}

function range (min, max) {
  return random(max - min) + min;
}

// a time is {time, fn}
class TimerQueue {
  constructor () {
    this.timers = [];         // list of {time, fn} ordered by time
    this.id = undefined;      // the setTimeout() id, if any
    this.next = undefined;    // the time targeted by setTimeout()
  }

  // time in ms before popping timer
  addTimer (ms, fn) {
    const target = Date.now() + ms;

    let i = 0;
    while (this.timers[i] && target >= this.timers[i].time) {
      i += 1;
    }
    this.timers.splice(i, 0, {time: target, fn});

    // if there are no more timers in the queue after executing those that
    // expired we're done.
    if (this.executeExpired() === 0) {
      return;
    }

    // if a new timer pops before the current timeout clear it.
    if (this.next && this.timers[0].time < this.next) {
      clearTimeout(this.id);
      this.setNextTimeout();
    } else if (!this.next) {
      this.setNextTimeout();
    }
  }

  setNextTimeout () {
    this.next = this.timers[0].time;
    this.id = setTimeout(() => {
      if (this.executeExpired()) {
        this.setNextTimeout();
      } else {
        this.next = undefined;
        this.id = undefined;
      }
    }, this.timers[0].time - Date.now());
  }

  executeExpired () {
    let now = Date.now();

    // execute any functions whose time has come.
    while (this.timers.length && this.timers[0].time <= now) {
      const timer = this.timers.shift();
      timer.fn();
      // update just in case a function takes a long time to execute.
      now = Date.now();
    }

    return this.timers.length;
  }

}
