const imagemin = require('imagemin');
const imageminSvgo = require('imagemin-svgo');
const keywords = require('./keywords.json');
let icons = {};
const options = {
  plugins: [
    {cleanupIDs: {remove: false}},
    {removeStyleElement: true},
    {removeUselessDefs: true},
    {removeUselessStrokeAndFill: true},
    {removeHiddenElems: true},
    {removeEmptyText: true},
    {convertShapeToPath: true},
    {
      custom: { // this could be any name except the already registered ones
        type: 'full', // full, perItem or perItemReverse
        description: 'My custom plugin',
        params: {}, // some arbitrary data
        fn: function(data, params) {
          // custom plugin code goes here
          console.log(data.content[0].attrs)
          console.log(data.content[0].content)
          return data;
        }
      }
    },
    {removeEmptyAttrs: true},
    {removeEmptyContainers: true},
    {mergePaths: true},
    {removeTitle: true},
    {removeDesc: true},
    {removeDimensions: true},
    {removeAttrs: {attrs: ['class', '(stroke|fill)']}},
  ],
  multipass: true
};

imagemin(['*.svg'], './', { use: [imageminSvgo(options)] })
  .then(function (result) {
    options.plugins[0] = {cleanupIDs: {remove: true}};
    return imagemin(['icons/*.svg'], 'icons/', { use: [imageminSvgo(options)] })
  })
  .then(function (result) {
    console.log("✨ icons optimized successfully")
  });
