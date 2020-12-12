# csi challenge

task at hand, questions (string-counter may not have been what you were looking for).

## my assumptions
- instrument String, not a low-level V8 C++ constructor. i don't know how to do but it's possible by rebuilding v8 from source; my take is that's out of scope (and i want to define the task in a way that's solvable for me).
- specifically says "String objects" but I am including the results of `String(8)` in addition to `new String(8)`.

# mea culpa
- i'm not a ui guy; i prefer command lines. the barely functional presentation of web pages in the
demo is proof.
- koa-app/index.js could be better segmented to be a pure csi command line tool to run apps. it's mix of
app and instrumentation startup now.

## organization

- koa-app/ - dual purpose (app + backend metrics collector)
  - routes/ - route-specific logic
  - views/ - pug templates
  - configuration.js - handles env vars and command line options
  - index.js - startup code interprets options and starts application (could be csi main).
  - koa-app - koa-specific startup
  - metrics - the backend server portion of the app
- csi/ - the csi package that would be installed by the user
  - patchers/ - module-patching modules
  - csi.js - main module, aggregates csi components
  - debug.js - initiates debug logging facility
  - patch-via-require.js - replaces default require mechanism and patches instrumented modules
  - recorder.js - outputs metrics to destinations
  - string-counter.js - replaces String with counted version
- test/ - unit tests
- start-server.sh - script to facilitate starting a demo

## how it works

## api
