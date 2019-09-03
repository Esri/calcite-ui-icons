const optimize = require('./optimize');
const generatePathFile = require('./path-data');

module.exports = function () {
  return optimize('*.svg')
    .then(function () {
      return optimize('icons/*.svg', true);
    })
    .catch(function (error) {
      console.error('🚨  Error while optimizing icons');
      throw error;
    })
    .then(function () {
      console.log('✨  icons optimized successfully');
      return generatePathFile();
    })
    .catch(function (error) {
      console.error('🚨  Error while generating icons.json');
      throw error;
    })
    .then(function (files) {
      console.log('✨  path file generated at ./docs/icons.json');
      return files;
    });
}
