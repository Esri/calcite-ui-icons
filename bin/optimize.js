const fs = require('fs-extra');
const glob = require('glob-promise');
const path = require('path');
const SVGO = require('svgo');
const progress = require('cli-progress');

let options = {
  plugins: [
    {cleanupIDs: {remove: false}},
    {removeStyleElement: true},
    {removeUselessDefs: true},
    {removeUselessStrokeAndFill: true},
    {removeHiddenElems: true},
    {removeEmptyText: true},
    {convertShapeToPath: true},
    {convertPathData: { noSpaceAfterFlags: false }},
    {removeEmptyAttrs: true},
    {removeEmptyContainers: true},
    {mergePaths: true},
    {removeTitle: true},
    {removeDesc: true},
    {removeDimensions: true},
    {removeAttrs: {attrs: ['class', '(stroke|fill)']}}
  ],
  multipass: true
};

/**
 * Reads an icon file off disk and optimizes it, saving to same location
 * @param {array}              filePaths  array of relative file paths
 * @param {SVGO}               svgo       SVGO instance with correct options
 * @param {SingleBar}          bar        progress bar instance
 * @return {promise}
 */
function optimizeIcons (filePaths, svgo, bar) {
  var num = 0;
  return Promise.all(filePaths.map(function (filePath) {
    return fs.readFile(filePath, 'utf-8')
      .then(function (svg) {
        return svgo.optimize(svg, { path: filePath });
      })
      .then(function (result) {
        num++
        bar.update(num);
        return fs.writeFile(filePath, result.data, 'utf-8');
      });
  }));
}

/**
 * Optimize a set of icons
 * @param {string}   files       Glob pattern for icons source
 * @param {boolean}  removeIds   Remove id attributes from output
 * @return {promise}             Formatted object with all icon metadata
 */
module.exports = function (files, removeIds) {
  if (!files) {
    return Promise.resolve(true);
  }
  options.plugins[0] = {cleanupIDs: {remove: removeIds}};
  svgo = new SVGO(options);
  return glob(files).then(function(iconPaths) {
    const bar = new progress.SingleBar({
      format: "  \x1b[32m {bar} {percentage}% | {value}/{total} \x1b[0m"
    }, progress.Presets.shades_classic);
    bar.start(iconPaths.length, 0);
    return optimizeIcons(iconPaths, svgo, bar)
      .then(function () {
        bar.stop();
        console.log("");
      })
  });
}
