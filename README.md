# TIFF to PNG
A batch converter for multi page TIFF files to png or any other format you have support for within your installation of imagemagick. 

# Purpose
This module was created to solve the problem of passing 100+ multi page TIFFs into a converter.

# How it works
TIFF to PNG allows you to pass an array of paths of TIFF files (strings). It will then iterate through the array and convert each TIFF one at a time (synchronously).

Each TIFF is split and placed in a folder with the same name as the original file without the extension. Once complete the location you supply will have a list of folders with image files inside in the format you requested. This is best suited for multipage TIFFs as the pages will be split and have a png file each.

# Getting Started
## Installation
Install "tiff-to-png" using npm, append "--save" to save it in your package.json
```
$ npm install tiff-to-png
```
## Simple example
TIFF to PNG requires instantiating to get access to it's features.
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

## Options
The full options object is as follows:
```
{
  type: 'jpg',
  logLevel: 1,
  prefix: 'page',
  suffix: '_foo'
}
```
| Option   | Default | Description                                                                                                                 |
|----------|---------|-----------------------------------------------------------------------------------------------------------------------------|
| type     | 'png'   | The file type of the converted files                                                                                        |
| logLevel | 0       | The level of the logs required. 0: Errors only, 1: Information                                                              |
| prefix   | 'page'  | The string that will be prepended to the file names of the pages converted. E.g. 'page': page1.png                          |
| suffix   | ''      | The string that will be appended onto the end of the file names of the page converted. E.g. '_invoices': page1_invoices.png |

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
| converted | An array of objects that contain the original path, the target path and whether the conversion is a success or not. |
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
| Argument  | Description                                                                                                                                     |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| errors    | An array of strings with the error returned by Imagemagick on fail                                                                              |
| converted | The 'converted' argument is an array of objects that contain the original path, the target path and whether the conversion is a success or not. |
| total     | The total number of requested conversions                                                                                                       |

## Accessible Variables
Some variables that are accessible off the Tiff to PNG instance.

| Variable  | Description                                                                                                         |
|-----------|---------------------------------------------------------------------------------------------------------------------|
| converted | An array of objects that contain the original path, the target path and whether the conversion is a success or not. |
| total     | The total number of requested conversions                                                                           |
| location  | The location that the converted file will be stored                                                                 |
| tiffs     | The list of TIFFs passed to convertArray                                                                            |
| options   | The options passed during instantiation                                                                             |
| errors    | An                                                                                                                  |

### Example
```javascript
var ConvertTiff = require('tiff-to-png'),
  converter = new ConvertTiff();

var tiffs = [
  '/home/tiffs/document_one.tif',
  '/home/tiffs/document_two.tif'
];
var location = '/srv/www/mysite/public/documents';

converter.convertArray(tiffs, location);

console.log('Started converting %i TIFFs', converter.total);
```

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


