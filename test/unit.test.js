const expect = require('chai').expect;
const {patcher, getStringCounts} = require('../contrast/contrast.js');

describe('unit tests', function () {

  describe('string objects', function () {
    it('should count new string objects correctly', function () {
      const initialCounts = getStringCounts();
      const n = random(100);
      for (let i = 0; i < n; i++) {
        new String(i);
      }
      const currentCounts = getStringCounts();
      expect(currentCounts.objCalls).equal(initialCounts.objCalls + n, `${n} string ojects should be created`);
    });

    it('should count string conversions correctly', function () {
      const initialCounts = getStringCounts();
      const n = random(100);
      for (let i = 0; i < n; i++) {
        String(i);
      }
      const currentCounts = getStringCounts();
      expect(currentCounts.strCalls).equal(initialCounts.strCalls + n, `${n} string ojects should be created`);
    });

  });

  describe('modules loaded', function () {
    let initial;
    let afterKoa;

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
      expect(afterKoa.installed.patchedItems[0][0]).equal('koa');
      expect(afterKoa.installed.patchedItems[0][1]).equal(1);

      for (let i = 0; i < afterKoa.installed.unpatchedItems.length; i++) {
        const [name] = afterKoa.installed.unpatchedItems[i];
        expect(name).not.equal('koa', 'koa should not appear in the unpatchedItems list');
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
      expect(final.installed.patchedItems[0][0]).equal('koa');
      expect(final.installed.patchedItems[0][1]).equal(1);

      let koaFound = false;
      let koaCount = 0;
      for (let i = 0; i < final.installed.unpatchedItems.length; i++) {
        const [name, count] = final.installed.unpatchedItems[i];
        if (name === 'koa') {
          koaFound = true;
          koaCount = count;
          break;
        }
      }
      expect(koaFound).equal(true, 'koa should appear in the unpatchedItems list');
      expect(koaCount).equal(1, 'koa should have been unpatched exactly once');
    });

  });
});


function random (n) {
  return Math.round(Math.random() * n);
}
