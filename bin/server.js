#!/usr/bin/env node
const build = require('./build');
const pathData = require('./path-data');
const bs = require('browser-sync').create();
const fs = require('fs');


console.log('optimizing icons...')

build(true).then(() => {
  bs.init({
    server: './docs',
    notify: false,
    ui: false,
    port: 8080
  });
  bs.watch('icons/*.svg', {ignoreInitial: true}, onChange);
  bs.watch('docs/keywords.json', {ignoreInitial: true}, onChange);

  function onChange (event, file) {
    if (event === 'change' || event === 'add') {
      console.log('icon changes detected, rebuilding...')
      pathData().then(files => {
        console.log('✨  path file updated');
        bs.reload();
      });
    }
  }
});
