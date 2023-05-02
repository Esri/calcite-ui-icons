const fs = require("fs-extra");
const glob = require("glob-promise");
const svgo = require("svgo");
const progress = require("cli-progress");

let options = {
  plugins: [
    {
      name: "cleanupIds",
      params: { remove: false },
    },
    { name: "removeAttrs", params: { attrs: ["class", "(stroke)"] } },
    { name: "convertShapeToPath", params: { convertArcs: true } },
    { name: "convertPathData", params: { noSpaceAfterFlags: false } },
    "removeStyleElement",
    "removeUselessDefs",
    "removeHiddenElems",
    "removeEmptyText",
    "removeEmptyAttrs",
    "removeEmptyContainers",
    "removeTitle",
    "removeDesc",
    "removeDimensions",
  ],
  multipass: true,
};

/**
 * Reads an icon file off disk and optimizes it, saving to same location
 * @param {string[]}           filePaths   array of relative file paths
 * @param {svgoOptions}        svgoOptions options to pass to the optimize function
 * @param {SingleBar}          bar         progress bar instance
 * @return {Promise}
 */
function optimizeIcons(filePaths, svgoOptions, bar) {
  var num = 0;
  return Promise.all(
    filePaths.map((path) => {
      return fs
        .readFile(path, "utf-8")
        .then((svg) => svgo.optimize(svg, { ...svgoOptions, path }))
        .then((result) => {
          num++;
          bar.update(num);
          return fs.writeFile(path, result.data, "utf-8");
        });
    })
  );
}

/**
 * Optimize a set of icons
 * @param {string}   files       Glob pattern for icons source
 * @param {boolean}  remove      Remove id attributes from output
 * @return {Promise}             Formatted object with all icon metadata
 */
module.exports = function (files, remove) {
  if (!files) {
    return Promise.resolve(true);
  }
  options.plugins[0].params = { remove };
  return glob(files).then((iconPaths) => {
    const format = "  \x1b[32m {bar} {percentage}% | {value}/{total} \x1b[0m";
    const bar = new progress.SingleBar(
      { format },
      progress.Presets.shades_classic
    );
    bar.start(iconPaths.length, 0);
    return optimizeIcons(iconPaths, options, bar).then(() => {
      bar.stop();
      console.log("");
    });
  });
};
