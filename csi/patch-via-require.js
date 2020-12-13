//
// patch the require function to enable patching modules as they are loaded.
//
const Module = require('module');
const glob = require('glob');
const path = require('path');

const debug = require('./debug.js');
const log = {
  error: debug.make('error'),
  patch: debug.make('patch'),
};

const counts = {
  builtin: {
    patched: new Map(),
    unpatched:new Map(),
  },
  installed: {
    patched: new Map(),
    unpatched: new Map(),
  },
  relative: {
    patched: new Map(),
    unpatched: new Map(),
  },
  errors: new Map(),
};

// wrap the native require function to count unpatched modules loaded.
const nativeRequire = module.constructor.prototype.require;
const realRequire = function (name) {
  counts.unpatched += 1;
  return nativeRequire.call(this, name);
}
module.constructor.prototype.require = realRequire;


const patchers = new Map();
const patched = new WeakMap();

exports = module.exports = {
  // Set locations of instrumentation wrappers to patch named modules
  register (name, path) {
    patchers.set(name, {path, enabled: true});
  },
  deregister (name) {
    patchers.delete(name);
  },

  //
  // Patch require function to monkey patch at load-time
  //
  enable () {
    module.constructor.prototype.require = requireAndPatch;
  },
  disable () {
    module.constructor.prototype.require = realRequire;
  },

  //
  // counters
  //
  getCounts () {
    const o = {errors: counts.errors.size};
    ['builtin', 'installed', 'relative'].forEach(type => {
      o[type] = {
        patched: counts[type].patched.size,
        unpatched: counts[type].unpatched.size,
        patchedItems: [...counts[type].patched.entries()],
        unpatchedItems: [...counts[type].unpatched.entries()],
      };
    });

    return o;
  }
}

function add (map, name, n = 1) {
  const m = map.get(name);
  if (!m) {
    map.set(name, 1);
  } else {
    map.set(name, m + 1);
  }
  counts.seq += 1;
}

//
// function to do the real work
//
function requireAndPatch (name) {
  let mod = nativeRequire.call(this, name);
  if (!mod) {
    add(counts.errors, name);
    return mod;
  }

  let counters;
  // determine what is being counted
  if (Module.builtinModules.indexOf(name) >= 0) {
    counters = counts.builtin;
  } else if (name[0] === '.' || name[0] === '/') {
    counters = counts.relative;
  } else {
    counters = counts.installed;
  }

  // if no patcher for the package just count it.
  if (!patchers.get(name)) {
    add(counters.unpatched, name);
    return mod;
  }

  // Only apply patchers on first require
  if (!patched.get(mod)) {
    const options = {name};
    const path = Module._resolveFilename(name, this);

    // require the patcher with the real module as the first argument.
    mod = nativeRequire(patchers.get(name).path)(mod, options);

    // Mark this module patched
    patched.set(mod, true);

    // Replace cached version
    if (require.cache[path]) {
      require.cache[path].exports = mod;
    }

    log.patch(`patched ${name}`);
    add(counters.patched, path);
  } else {
    const path = Module._resolveFilename(name, this);
    add(counters.unpatched, path);
  }

  return mod;
}


//
// Build a list of all modules we have patchers for
//
let patchFiles;
try {
  patchFiles = glob.sync('*.js', {
    cwd: path.join(__dirname, 'patchers')
  })
} catch (e) {
  log.error('failed to load available patchers', e.message);
}

patchFiles.forEach(file => {
  const m = file.match(/^(.*)+\.js$/);
  if (m && m.length == 2) {
    const name = m[1];
    exports.register(name, path.join(__dirname, 'patchers', name));
    log.patch(`found ${name} probe`);
  }
});
