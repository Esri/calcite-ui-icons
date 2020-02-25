# Calcite UI Icon converter for mobile and desktop

Script to convert calcite icons for use on mobile and desktop.

To convert a single icon:

```sh
$ node ./convert.js -n "3d-glasses" -o "./output"
```

To convert all icons to a 64x64 version suitable for WPF:

```sh
$ npm run convert_all
```

To convert all icons for use with iOS (creates an imageset for each icon):

```sh
$ npm run convert_all_ios
```