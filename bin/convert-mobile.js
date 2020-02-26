#!/usr/bin/env node

const fs = require('fs');
const svg2img = require('svg2img');
const path = require('path');
const yargs = require('yargs');

const baseIconPath = './icons/';
var sourceIconSuffix = '-32.svg';
// default output path, can be overridden
var outputRoot = path.join(__dirname, 'output')
// default output size, can be overridden
var outputSize = 64;

/**
 * Converts a single svg to png, with given width & height values
 * @param {string} iconName - name of the icon, without size or file extension (e.g. '2d-explore')
 * @param {int} width - width of output file in pixels
 * @param {int} height - height of output file in pixels
 * @param {string} outputRoot - base directory in which to store output
 * @param {string} outputSuffix - suffix appended to outputed file (e.g. '.png')
 */
function convertSingleIconToPng(iconName, width, height, outputRoot, outputSuffix) {
  // make paths and whatnot
  const sourceSvgIconPath = path.join(baseIconPath, iconName + sourceIconSuffix);
  const real_output_path = path.join(outputRoot, iconName + outputSuffix);

  // make sure output path exists
  if (!fs.existsSync(outputRoot)) {
    fs.mkdirSync(outputRoot, { recursive: true });
  }

  // convert and save the image
  svg2img(sourceSvgIconPath, { 'width': width, 'height': height }, function (error, buffer) {
    if (error){
      console.log(error);
      process.exit(1);
    }
    fs.writeFileSync(real_output_path, buffer);
  });
}

/**
 * Creates an ImageSet (including Contents.json file) for an icon
 * @param {string} iconName - name of the icon without size or extension (e.g. '2d-explore')
 * @param {string} outputRoot - base directory in which to store the imageset folder
 */
function convertIconToXcodeImageSet(iconName, outputRoot) {
  const new_output_root = path.join(outputRoot, iconName + '.imageset');

  // Create images at 3 sizes
  convertSingleIconToPng(iconName, 32, 32, new_output_root, '@1x.png');
  convertSingleIconToPng(iconName, 64, 64, new_output_root, '@2x.png');
  convertSingleIconToPng(iconName, 96, 96, new_output_root, '@3x.png');

  // read template
  const template_path = path.join(__dirname, 'templates', 'imageset.json');

  fs.readFile(template_path, 'utf8', function (error, buffer) {
    if (error){
      console.log(error);
      process.exit(1);
    }
    const new_output_string = buffer.replace(/\$\{NAME\}/g, iconName);
    const contents_output_path = path.join(new_output_root, 'Contents.json');
    fs.writeFile(contents_output_path, new_output_string, function (error) { });
  });
}

const options = yargs
  .usage('Usage: -n <name of icon, omit if doing bulk>, \n-s <output size, pixels, default 64>, \n-o <output path (defaults to ./output)>, \n-p <target platform (e.g. ios) \n-i <16, 24, 32, omit for 16>')
  .option('n', { alias: 'name', describe: 'name of icon, without -32.svg; omit to convert all icons', type: 'string', demandOption: false })
  .option('o', { alias: 'outputDir', describe: 'output path, relative to this script', type: 'string', demandOption: false })
  .option('p', { alias: 'outputPlatform', describe: 'target platform, valid options are: ios', type: 'string', demandOption: false })
  .option('i', { alias: 'inSize', describe: 'source svg variant, defaults to 16', type: 'string', demandOption: false })
  .option('s', {alias: 'outSize', describe: 'size of output image in pixels, doesn\'t apply when targeting specific platform', type: 'string', demandOption: false})
  .argv;

if (options.outputDir) {
  outputRoot = path.join(__dirname, options.outputDir);
}

// update output size if set
if (options.outSize){
  outputSize = parseInt(options.outSize);
}

// update source icon size based on output size if source not explicitly set
if (!options.inSize && options.outSize){
  if (options.outSize < 24){
    sourceIconSuffix = '-16.svg';
  } else if (options.outSize < 32){
    sourceIconSuffix = '-24.svg';
  } else {
    sourceIconSuffix = '-32.svg';
  }
}

// set insize if explicitly set
if (options.inSize === '16'){
  sourceIconSuffix = '-16.svg';
} else if (options.inSize === '24'){
  sourceIconSuffix = '-24.svg';
} else if (options.inSize === '32'){
  sourceIconSuffix = '-32.svg';
}

if (options.outputPlatform === 'ios'){
  // Put in .xcassets folder
  outputRoot = path.join(outputRoot, 'calcite.xcassets');
  
  // Make sure dir exists
  if (!fs.existsSync(outputRoot)) {
    fs.mkdirSync(outputRoot, { recursive: true });
  }

  // read contents.json template
  const template_path = path.join(__dirname, 'templates', 'xcassets.json');

  // write out file
  fs.readFile(template_path, 'utf8', function (error, buffer) {
    if (error){
      console.log(error);
      process.exit(1);
    }
    const contents_output_path = path.join(outputRoot, 'Contents.json');
    fs.writeFile(contents_output_path, buffer, function (error) { });
  });
}

if (options.name) {
  if (options.outputPlatform === 'ios') {
    convertIconToXcodeImageSet(options.name, outputRoot);
  } else {
    convertSingleIconToPng(options.name, outputSize, outputSize, outputRoot, `-${outputSize}.png`);
  }
} else {
  fs.readdir(baseIconPath, function (err, files) {
    //handling error
    if (err) {
      console.log(err);
      process.exit(1);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      const base_name = path.basename(file);
      if (base_name.endsWith('-16.svg')) {
        const iconName = base_name.substring(0, base_name.length - 7);

        if (options.outputPlatform === 'ios') {
          convertIconToXcodeImageSet(iconName, outputRoot);
        } else {
          convertSingleIconToPng(iconName, outputSize, outputSize, outputRoot, `-${outputSize}.png`);
        }
      }
    });
  });
}
