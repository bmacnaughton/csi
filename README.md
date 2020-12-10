# contrast security challenge

task at hand, questions (string-counter may not have been what you were looking for).

## organization

- koa-app/ - dual purpose (app + backend metrics collector)
  - routes/ - route-specific logic
  - views/ - pug templates
  - configuration.js - handles env vars and command line options
  - index.js - startup code interprets options and starts application (could be contrast main).
  - koa-app - koa-specific startup
  - metrics - the backend server portion of the app
- contrast/ - the contrast-security package that would be installed by the user
  - patchers/ - module-patching modules
  - contrast.js - main module, aggregates contrast components
  - debug.js - initiates debug logging facility
  - patch-via-require.js - replaces default require mechanism and patches instrumented modules
  - recorder.js - outputs metrics to destinations
  - string-counter.js - replaces String with counted version
- test/ - unit tests
- start-server.sh - script to facilitate starting a demo

## how it works

## api
