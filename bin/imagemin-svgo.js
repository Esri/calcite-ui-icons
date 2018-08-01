const imagemin = require('imagemin');
const imageminSvgo = require('imagemin-svgo');
const options = {
  use: [
    imageminSvgo({
      plugins: [
        {cleanupIDs: {remove: true}},
        {removeStyleElement: true},
        {removeUselessDefs: true},
        {removeUselessStrokeAndFill: true},
        {removeHiddenElems: true},
        {removeEmptyText: true},
        {convertShapeToPath: true},
        {removeEmptyAttrs: true},
        {removeEmptyContainers: true},
        {mergePaths: true},
        {removeTitle: true},
        {removeDesc: true},
        {removeDimensions: true},
        {removeAttrs: {attrs: ['class', '(stroke|fill)']}}
      ],
      multipass: true
    })
  ]
};

imagemin(['icons/*.svg'], 'icons/', options)
  .then(function (result) {
    console.log("✨ icons optimized successfully")
  });