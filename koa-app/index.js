//
// get the configuration, issue messages if needed,
// configure appropriately and kick off the server.
//
const configuration = require('./configuration.js');

async function main () {

  const config = await configuration.get({prefix: 'APP_'});
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
  // now that configuration errors, warnings, etc. are done load csi
  // if configured.
  //

  let log;
  if (options.enabled) {
    const csi = require('../csi/csi');
    csi.patcher.enable();
    log = csi.log;

    // set where the metrics are recorded so they'll be ready when
    // the app is started.
    const {beIp, logFile} = options;
    await csi.recorder.setOptions({
      endpoint: beIp,
      // eslint-disable-next-line no-console
      output: options.output ? console.log : null,
      logFile: logFile
    });
  }

  //
  // get and start the app
  //
  const koaapp = require('./koa-app.js');

  if (log) {
    log.info(`starting app on localhost:${options.port}`);
  }
  const server = await koaapp.start({port: options.port});

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

