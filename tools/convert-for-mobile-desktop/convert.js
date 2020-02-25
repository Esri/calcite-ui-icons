#!/usr/bin/env node

var fs = require('fs');
var svg2img = require('svg2img');
var path = require('path');
const yargs = require("yargs");

var base_path = "../../icons/";
var suffix = "-32.svg";
// defualt output path, can be overridden
var output_root = path.join(__dirname, "output")
 
function convert_single(filename_core, width, height, output_root, output_suffix){
    // make paths and whatnot
    var real_source_path = path.join(base_path, filename_core + suffix);
    var real_output_path = path.join(output_root, filename_core + output_suffix);

    // make sure output path exists
    if (!fs.existsSync(output_root)){
        fs.mkdirSync(output_root, { recursive: true });
    }

    // convert and save the image
    svg2img(real_source_path, {'width': width, 'height': height}, function(error, buffer) {
        fs.writeFileSync(real_output_path, buffer);
    });
}

function convert_for_ios(filename_core, output_root){
    var new_output_root = path.join(output_root, filename_core + ".imageset");

    // Create images at 3 sizes
    convert_single(filename_core, 32, 32, new_output_root, "@1x.png");
    convert_single(filename_core, 64, 64, new_output_root, "@2x.png");
    convert_single(filename_core, 96, 96, new_output_root, "@3x.png");

    // read template
    var template_path = path.join(__dirname, "templates", "Contents.json");

    fs.readFile(template_path, 'utf8', function(error, buffer){
        var new_output_string = buffer.replace(/\$\{NAME\}/g, filename_core);
        var contents_output_path = path.join(new_output_root, "Contents.json");
        fs.writeFile(contents_output_path, new_output_string, function(error){});
    });
}

const options = yargs
 .usage("Usage: -n <name of icon, omit if doing bulk>, -o <output path (defaults to ./output)>, -p <target platform (e.g. ios)")
 .option("n", { alias: "name", describe: "name of icon, without -32.svg; omit to convert all icons", type: "string", demandOption: false })
 .option("o", { alias: "output_dir", describe: "output path, relative to this script", type: "string", demandOption: false })
 .option("p", { alias: "output_platform", describe: "target platform, valid options are: ios", type: "string", demandOption: false })
 .argv;

if (options.output_dir){
    output_root = path.join(__dirname, options.output_dir);
}

if (options.name){
    if (options.output_platform == "ios"){
        convert_for_ios(options.name, output_root);
    } else {
        convert_single(options.name, 64, 64, output_root, ".png");
    }
} else {
    fs.readdir(base_path, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        var base_name = path.basename(file);
        if (base_name.endsWith('-32.svg')){
            var real_base_name = base_name.substring(0, base_name.length - 7);

            if (options.output_platform == "ios"){
                convert_for_ios(real_base_name, output_root);
            } else {
                convert_single(real_base_name, 64, 64, output_root, ".png");
            }
        }
    });
});
 
}

