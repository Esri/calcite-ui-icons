#!/usr/bin/env node
const build = require('./build');

build(true)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
