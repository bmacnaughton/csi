//
// get the configuration, issue messages if needed,
// configure appropriately and kick off the server.
//
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
      console.error(`${type}: ${config[type].join(', ')}`);
      errorCount += config[type].length;
    }
  });
  if (errorCount) {
    process.exit(1);
  }

  ['warnings', 'unknowns'].forEach(type => {
    if (config[type] && config[type].length) {
      // eslint-disable-next-line no-console
      console.warn(`${type}: ${config[type].join(', ')}`);
    }
  });

  if (options.verbose) {
    if (config.debuggings && config.debuggings.length) {
      // eslint-disable-next-line no-console
      console.log(`config debug output: ${config.debuggings.join(', ')}`);
    }
  }

  //
  // status updates are out of the way, start the program.
  //

  let getCounts;
  let log;
  if (options.contrastEnabled) {
    const csi = require('../contrast/contrast');
    //const {patcher, recorder, getStringCounts, loggers} = require('../contrast/contrast.js');
    csi.patcher.enable();
    getCounts = function () {
      const o = {stringCount: csi.getStringCounts()};
      return Object.assign(o, csi.patcher.getCounts());
    }
    log = csi.log;

    // set where the metrics are recorded so they'll be ready when
    // the app is started.
    const {beIp, logFile} = options;
    await csi.recorder.setOptions({endpoint: beIp, logToFile: logFile});
  } else {
    getCounts = function () {
      const o = {};
      return o;
    }
    // eslint-disable-next-line no-console
    log = console.log;
  }

  //
  // get and start the app
  //
  const koaapp = require('./koa-app.js');

  // eslint-disable-next-line no-unused-vars
  log.info(`starting app on localhost:${options.port}`);
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

