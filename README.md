# TIFF to PNG
[![Build Status](https://travis-ci.org/RickCraig/node-tiff-to-png.svg?branch=master)](https://travis-ci.org/RickCraig/node-tiff-to-png)

A batch converter for multi page TIFF files to png or any other format you have support for within your installation of imagemagick.

# Purpose
This module was created to solve the problem of passing 100+ multi page TIFFs into a converter.

# Upgrading from v1.x.x to v2
V2 is written from the ground up and will require a version of Node.js that supports async/await. **The scene option passed to the command for imagemagick is now optional and by default is not passed the (old default was `scene=1`), the removal of this may cause errors, to make it act like v1.x.x just add the option `{ scene: 1 }` when instantiating TIFF to PNG.** Some variables that were once accessible have been removed, including converted, total, errors and location. These were instance variables that can be collected without accessing the instance:
- `converted` can be collected inside the progress and completed callbacks as well as in the resolve of the promise returned
- `total` is the number of files to be converted, for example `convertArray(['file1.tif', 'file2.tif'])` has a total of 2
- `errors` are passed in the completed callback and as part of the data on resolve of the promise
- `location` is either passed in anyway or is the location of the TIFFS. Using the path library `path.dirname('/path/to/file.tif')` will return the location

# How it works
TIFF to PNG allows you to pass an array of paths of TIFF files (strings). It will then iterate through the array and convert each TIFF one at a time (synchronously).

Each TIFF is split and placed in a folder with the same name as the original file without the extension. Once complete the location you supply will have a list of folders with image files inside in the format you requested. This is best suited for multipage TIFFs as the pages will be split and have a png file each.

# Getting Started
## Installation
Install "tiff-to-png" using npm, append "--save" to save it in your package.json
```
$ npm install tiff-to-png
```
## Converting an array of TIFFs
```javascript
var ConvertTiff = require('tiff-to-png');

var options = {
  logLevel: 1
};

var converter = new ConvertTiff(options);

var tiffs = [
  '/home/tiffs/document_one.tif',
  '/home/tiffs/document_two.tif'
];
var location = '/srv/www/mysite/public/documents';

converter.convertArray(tiffs, location);
```

In the above example I am passing in 2 TIFF files to convert and place in the folder '/srv/www/mysite/public/documents'.

**Converting an array will prepend the filename to the output files to prevent file name conflicts**

### Returned
*Based on requesting 3 tiffs to be converted, 2 being successful and one failing due to an error*

```
{
  converted: [
    {
      tiff: 'path/to/tiff1.tif',
      target: 'path/to/save/location',
      success: true,
      filename: 'path/to/save/location/tiff1_%d.png'
    },
    {
      tiff: 'path/to/tiff2.tif',
      target: 'path/to/save/location',
      success: true,
      filename: 'path/to/save/location/tiff2_%d.png'
    },
    {
      tiff: 'path/to/tiff3.tif',
      target: 'path/to/save/location',
      success: false,
      filename: 'path/to/save/location/tiff3_%d.png'
    }
  ],
  errors: [
    {
      tiff: 'path/to/tiff3.tif',
      target: 'path/to/save/location',
      filename: 'path/to/save/location/tiff3_%d.png'
      error: 'This will be the response from Imagemagick when an error occurs'
    }
  ]
}
```

## Converting single TIFFs
```javascript
var ConvertTiff = require('tiff-to-png');

var options = {
  logLevel: 1
};

var converter = new ConvertTiff(options);
var location = '/srv/www/mysite/public/documents';

converter.convertOne('/home/tiffs/document_one.tif', location);
```

**Converting a single TIFF will not prepend the filename onto the output files**

### Returned

#### Succeeded
```
{
  converted: {
    tiff: 'path/to/tiff1.tif',
    target: 'path/to/save/location',
    success: true,
    filename: 'path/to/save/location/%d.png'
  },
  errors: []
}
```

#### Failed
```
{
  converted: {
    tiff: 'path/to/tiff1.tif',
    target: 'path/to/save/location',
    success: false,
    filename: 'path/to/save/location/%d.png'
  },
  errors: [
    {
      tiff: 'path/to/tiff1.tif',
      target: 'path/to/save/location',
      filename: 'path/to/save/location/%d.png'
      error: 'This will be the response from Imagemagick when an error occurs'
    }
  ]
}
```

## Options
The full options object is as follows:
```
{
  type: 'jpg',
  logLevel: 1,
  prefix: 'page',
  suffix: '_foo',
  tmpPath: '/path/to/tmp',
  autoRemoveTmp: true,
  commandPath: '/path/to/binary/convert.exe',
  scene: 1
}
```
| Option        | Default | Description                                                                                                                 |
|---------------|---------|-----------------------------------------------------------------------------------------------------------------------------|
| type          | 'png'   | The file type of the converted files                                                                                        |
| logLevel      | 0       | The level of the logs required. 0: Errors only, 1: Information                                                              |
| prefix        | 'page'  | The string that will be prepended to the file names of the pages converted. E.g. 'page': page1.png                          |
| suffix        | ''      | The string that will be appended onto the end of the file names of the page converted. E.g. '_invoices': page1_invoices.png |
| tmpPath       | null    | Overwrites the Imagemagick default tmp directory path                                                                       |
| autoRemoveTmp | false   | Automatically removes all files from tmpPath prefixed with magick-*, this happens on process completion                     |
| commandPath   | null    | Allows the specification of the command path for use with binaries or aliased convert commands                              |
| scene         | null    | The image scene number                                                                                                      |

## Callbacks
There are 2 available callbacks to allow you to create actions on the success of individual conversions and when the queue is complete.

### Progress
The progress callback is called every time a conversion has finished whether there was an error or not.
```javascript
var ConvertTiff = require('tiff-to-png'),
  converter = new ConvertTiff();

// Setup Callback
converter.progress = function(converted, total){
  // Do something with converted and/or total
};

var tiffs = [
  '/home/tiffs/document_one.tif',
  '/home/tiffs/document_two.tif'
];
var location = '/srv/www/mysite/public/documents';

converter.convertArray(tiffs, location);
```
| Argument  | Description                                                                                                                                     |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| converted | An array of objects that contain the original path, the target path and whether the conversion is a success or not.                             |
| total     | The total number of requested conversions                                                                                                       |

### Complete
The complete callback will be called when the conversion of the final TIFF has finished.
```javascript
var ConvertTiff = require('tiff-to-png'),
  converter = new ConvertTiff();

// Setup Callback
converter.complete = function(errors, total){
  // Do something with errors and/or total
};

var tiffs = [
  '/home/tiffs/document_one.tif',
  '/home/tiffs/document_two.tif'
];
var location = '/srv/www/mysite/public/documents';

converter.convertArray(tiffs, location);
```
| Argument  | Description                                                                                                                                                   |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| errors    | An array of strings with the error returned by Imagemagick on fail                                                                                            |
| converted | The 'converted' argument is an array of objects that contain the original path, the target path, the filename and whether the conversion is a success or not. |
| total     | The total number of requested conversions                                                                                                                     |

## Promises

TIFF to PNG now support promises. When you call convertArray or convertOne, a promise is return that will resolve on complete, or reject on fatal error.

```javascript
// Promise
converter.convertOne('myFile.tiff', '/path/to/location')
  .then(({ converted, error }) => {
    // Do the business on complete
  });

// async/await
const myFunction = async (path, loc) => {
  const { converted, error } = await converter.convertOne(path, loc);
  // Do the business on complete
}
```

The data returned in the promise on resolve is exactly the same as the data returned in the `complete` callback.

## Save location
Passing a save location as a the second argument of the convert functions (`convertArray([], location)`, `convertOne('file.tiff', location)`) will allow you to put the processed results in any location you require. If you wish to save the processed results in place (in the same directory as the source), just pass `''` or don't pass a location at all `convertOne('myfile.tif')` or `convertArray(['file_one.tif', 'file_two.tif'])`.

## Logging
The logging has a similar appearce to mocha tests and will allow you to see the outcome of the conversion live from the comfort of your terminal window.

# Errors
If an error occurs during the conversion of a TIFF file the error will be logged, stored in the converted array and the error array. The queue will then continue to convert.

# Prerequisites
TIFF to PNG requires imagemagick to convert TIFFs to any format.

# Testing
```
npm test
```

# Contributing
This module was originally written to be used in a production environment. This will ensure that this module is well maintained, bug free and as up to date as possible.

I will continue to make updates as often as required to have a consistently bug free platform, but I am happy to review any feature requests or issues and am accepting constructive pull requests.

# Changelog

## v2.0.0
Version 2 changes the entire codebase to be more modern and take advantage of async/await as well improving the code quality. v2 is a re-write from the ground up and is not compatible with v1.x.x implementations. Changes are as follows:

- Rewrite of entire codebase to utilise promises and async/await (written for node 8.9.1)
- Tests re-written and all supporting dependancies updated to latest
- Now supports promises on return (as well as callbacks)
- Save in place no available by leaving the location blank or undefined
- Made the scene command option optional (not added by default)
- Spaces are now supported in paths
