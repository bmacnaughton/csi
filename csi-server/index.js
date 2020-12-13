//
// get the configuration, issue messages if needed,
// configure appropriately and kick off the server.
//
const configuration = require('./configuration');
const {loggers: log} = require('./loggers');


async function main () {

  const config = await configuration.get({prefix: 'CSI_'});
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
  // status updates are out of the way, get and start the server.
  //

  const csiServer = require('./csi-server.js');

  // eslint-disable-next-line no-unused-vars
  log.info(`starting app on localhost:${options.port}`);
  const server = await csiServer.start({port: options.port, log});

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

