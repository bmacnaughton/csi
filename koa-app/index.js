const configuration = require('./configuration.js');

async function main () {

  const config = await configuration.get();
  const {values: options, fatals, errors, warnings, unknowns, debuggings} = config;
  console.log(options);
  if (options.commandLineOnly) {
    console.log(config);
    process.exit(0);
  }

  let getCounts;
  if (options.contrastActive) {
    const {patcher, getStringCounts, log} = require('../contrast/contrast.js');
    patcher.enable();

    getCounts = function () {
      const o = {stringCount: getStringCounts()};
      return Object.assign(o, patcher.getCounts());
    }
  } else {
    getCounts = function () {
      const o = {};
    }
  }

  const app = require('./app.js');

  app.start({getCounts});

  return new Promise((resolve, reject) => {});
}

(function () {
  main()
    .then(() => process.exit(0));
})();

