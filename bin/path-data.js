const camelCase = require('camelcase');
const fs = require('fs-extra');
const glob = require('glob-promise');
const path = require('path');
const util = require('util');
const svgson = util.promisify(require('svgson'));
const version = require('../package.json').version;

/**
 * Gets all important information about an icon.
 * @param {string} svg - Path to icon file.
 * @return {object} - Formatted object with all icon metadata
 */
function formatSVG (svg) {
  let file = path.basename(svg.file);
  return {
    file,
    filled: file.indexOf('-f.svg') > -1,
    paths: getPaths(svg.contents),
    size: getSize(file),
    variant: getVariant(file)
  };
}

/**
 * Find the path(s) from an icon's svgson data
 * @param {object} svg - Object as returned from svgson.
 * @return {array} - Array of paths
 */
function getPaths (svg) {
  return svg.childs
    .filter(child => child.name === 'path')
    .map(child => child.attrs.d);
}

/**
 * Find the base icon name
 * @param {string} name - Icon filename
 * @return {array} - Icon filename without size, fill, or file extension
 */
function getVariant (name) {
  var noF = name.replace('-f.svg', '.svg');
  return noF.substring(0, noF.length - 7);
}

/**
 * Find an icon's size
 * @param {string} name - Icon filename
 * @return {integer} - 16, 24, 36
 */
function getSize(name) {
  var noF = name.replace('-f.svg', '.svg');
  return parseInt(noF.substring(noF.length - 4, noF.length - 6), 10);
}

/**
 * Read an icon from disc and get data as json
 * @param {string} fileName - Icon filename (full path)
 * @return {Promise} - Promise resolving to object which includes name and svgson data
 */
function readSVG (fileName) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, 'utf-8').then(function (svg) {
      svgson(svg, {}, function (contents) {
        resolve({file: fileName, contents});
      });
    });
  });
}

module.exports = function generatePathFile () {
  let banner = '// File generated automatically by path-data.js, do not edit directly\n';
  let jsFile = `${banner}`;
  let tsFile = `${banner}`;
  return glob('icons/*.svg')
    .then(filePaths => Promise.all(filePaths.map(readSVG)))
    .then(files => files.map(formatSVG))
    .then(files => {
      let icons = {};
      let keywords = JSON.parse(fs.readFileSync('docs/keywords.json', 'utf-8'));
      files.forEach(file => {
        // add to json file
        icons[file.variant] = icons[file.variant] || keywords[file.variant] || {alias: [], category: "", release:""};
        let icon = icons[file.variant];
        icon.filled = icon.filled || {};
        icon.outline = icon.outline || {};
        icon[file.filled ? 'filled' : 'outline'][file.size] = file.paths;

        // add to ts and js files
        const variant = file.variant.match(/^\d/) ? `i${file.variant}`: file.variant;
        const filled = file.filled ? "F" : "";
        const camelCaseName = camelCase(`${variant}-${file.size}${filled}`);
        tsFile += `export const ${camelCaseName}: string;\n`;
        jsFile += `export {${camelCaseName}} from "./js/${camelCaseName}.js";\n`;
        const contents = `export const ${camelCaseName} = "${file.paths[0]}";\n`;
        const tsContents = `export const ${camelCaseName}: string;\n`;
        fs.writeFile(`js/${camelCaseName}.js`, contents, 'utf8');
        fs.writeFile(`js/${camelCaseName}.d.ts`, tsContents, 'utf8');
      });
      let promises = [
        fs.writeFile('docs/icons.json', JSON.stringify({ version, icons }), 'utf8'),
        fs.writeFile('index.d.ts', tsFile, 'utf8'),
        fs.writeFile('index.js', jsFile, 'utf8')
      ];
      return Promise.all(promises);
    });
};
