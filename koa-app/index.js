const configuration = require('./configuration.js');

async function main () {

  const config = await configuration.get();
  const {values: options} = config;
  if (options.commandLineOnly) {
    // eslint-disable-next-line no-console
    console.log(config);
    process.exit(0);
  }
  if (options.verbose) {
    // eslint-disable-next-line no-console
    console.log(options);
  }

  let errorCount = 0;
  // issue messages for bad configuration settings
  ['fatals', 'errors'].forEach(type => {
    if (config[type] && config[type].length) {
      // eslint-disable-next-line no-console
      console.log(`${type}: ${config[type].join(', ')}`);
      errorCount += config[type].length;
    }
  });
  if (errorCount) {
    process.exit(1);
  }

  ['warnings', 'unknowns'].forEach(type => {
    if (config[type] && config[type].length) {
      // eslint-disable-next-line no-console
      console.log(`${type}: ${config[type].join(', ')}`);
    }
  });

  if (options.verbose) {
    if (config.debuggings && config.debuggings.length) {
      // eslint-disable-next-line no-console
      console.log(`config debug output: ${config.debuggings.join(', ')}`);
    }
  }

  let getCounts;
  let log;
  if (options.contrastActive) {
    const {patcher, getStringCounts, loggers} = require('../contrast/contrast.js');
    patcher.enable();

    getCounts = function () {
      const o = {stringCount: getStringCounts()};
      return Object.assign(o, patcher.getCounts());
    }
    log = loggers;
  } else {
    getCounts = function () {
      const o = {};
    }
    // eslint-disable-next-line no-console
    log = console.log;
  }

  const koaapp = require('./app.js');

  // eslint-disable-next-line no-unused-vars
  const server = await koaapp.start({getCounts, port: options.port, log});

  server.context.server = server;

  // allow the application to exit if it chooses
  return new Promise(resolve => {
    server.on('exit', resolve);
  });

}

(function () {
  main()
    .then(m => {
      console.log(m);   // eslint-disable-line no-console
      process.exit(0)
    });
})();

