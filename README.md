[![Build Status](https://travis-ci.com/bmacnaughton/csi.svg?branch=master)](https://travis-ci.com/bmacnaughton/csi.svg?branch=master)

# csi

fun coding exercise

## my assumptions
- instrument String, not a low-level V8 C++ constructor. i don't know how to do that but it's possible by
rebuilding v8 from source; my take is that's out of scope (and i want to define the task in a way that's
solvable for me). but maybe i just don't know how to find out how many strings have been created.
- specifically says "String objects" but I am including the results of `String(8)` in addition to `new String(8)`.
if not it's a one-line change in `csi-server/metrics-store#getSummary()`.
- keeping track of required files for each request makes sense to see but having a list of required files
makes sense to. the program does not track required modules on a per-request basis but does report any
changes in required files that take place over the lifetime of a request. it could also send the entire list
of required files on an interval basis to minimize the per-request overhead as the list of required files can
be rather large. it doesn't do that at this time.

# mea culpa
- i'm not a ui guy; i prefer command lines. the barely functional presentation of web pages in this
exercise is proof.
- `koa-app/index.js` could be better segmented to be a pure csi command line tool to run apps. it's mix of
app and instrumentation startup now.
- it would be good to capture the path with each record. this would allow grouping by path for potentially
more relevant comparisons. this is not implemented.
- there is no abstraction, not even a version, for the record sent from the `csi` package to the `csi-server`.
- it doesn't patch when `import` (ecmascript modules) is used instead of `require`.

## overview

there are two servers, `koa-app` and `csi-server` and one instrumentation package, `csi`.

`koa-app` is any web server that is to be instrumented. it uses the `csi` package which is integrated into its
startup code in `koa-app/index.js`. (as noted above, `index.js` is a melange of mostly `csi` configuration and a
little bit of `koa-app` configuration.)

`csi-server` is an endpoint to which `csi` can send data.

`csi` is a module, required and configured by `koa-app`, that instruments `koa-app` and reports observations as
configured.

the two servers can be started with `start-server.sh`. detailed configuration options can be viewed in each
`configuration.js` file.

a note about configuration. options are specified in camel-case. the command line option converts uppercase
letters to a dash followed by the lowercase letter, e.g., `beIp` is `--be-ip` (single leading dash if the option
is only one character). the environment variable form converts uppercase letters to underscore followed by the
letter then prefixes the result and uppercases it. e.g., `beIp` is `APP_BE_IP`.

### koa-app

this is a simple app that uses the dog.ceo api to get data. the app lists dog breeds and each entry is a link
that fetches the individual dog record. so there are two different routes that each have a characteristic
instrumentation signature.

paths
- `/` - provides link to `/dogs`
- `/dogs` - list of links to dog breeds
- `/dogs/raw/:breed` - raw breed record.

environment variable prefix is `APP_`.

koa-app configuration
- `port` - default 3000

csi configuration
- `enabled` - boolean, load and use the csi module. default: true.
- `beIp` - string, endpoint to send metrics to. default: none.
- `output` - boolean, output to console. default: false.
- `logFile` - string, output to this log file. default: none.
- `logItems` - string, comma separated items for debug logging. default: 'error,warn'
- `verbose` - log some extra information.

### csi-server

this implements a server that collects metrics in an in-memory database. it provides a simple api.

api
- `get /` - returns api links
- `get /id/:id` - returns data for :id
- `get /all` - returns all records as object {key: record, ...}
- `get /summary` - returns a summary of all records
- `post /add` - the JSON body's object is added to the store

### csi

this is the installable package that instruments `koa-app`. the complete initialization is done in
`koa-app/index.js` following the line `if (options.enabled) {`. the initialization code could be
streamlined.

when `csi/csi.js` is required it initializes itself and returns an api to the user.

## organization

- csi/ - the csi package that would be installed by the user
  - patchers/ - module-patching modules
  - csi.js - main module, aggregates csi components
  - debug.js - initiates debug logging facility
  - patch-via-require.js - replaces default require mechanism and patches instrumented modules
  - recorder.js - outputs metrics to destinations
  - string-counter.js - replaces String with counted version

- csi-server/ - the metrics collection server
  - routes/ - route handlers
  - views/ - pug templates
  - configuration.js - handles env vars and command line options
  - csi-server.js - server-specific startup
  - index.js - startup code
  - loggers.js - debug/informational loggers
  - metrics-store.js - in memory metrics "db"

- koa-app/ - dog breed app
  - routes/ - route-specific logic
  - views/ - pug templates
  - configuration.js - handles env vars and command line options
  - index.js - startup code interprets options and starts application (mashup of csi and koa-app).
  - koa-app - koa-app-specific startup
  - metrics - the backend server portion of the app

- test/ - unit tests
- start-server.sh - script to facilitate starting the two servers

## testing

`$ npm test`
