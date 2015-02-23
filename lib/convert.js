var exec = require('child_process').exec,
  logger = require('./logger'),
  fs = require('fs');

/**
 * Options: 
 * page: 'A4', 'A3'
 * type: 'png', 'jpg'
 * logLevel: 1 = info, 0, error (default)
 */

var TiffConverter = function(options){
  var _this = this;

  _this.converted = [];
  _this.total = 0;
  _this.location = "";
  _this.tiffs = [];
  _this.options = options;
  _this.errors = [];

  /**
   * Callback to show the amount converted.
   */
  _this.progress = function(converted, total){
    logger.info(converted.length + ' of ' + total + 'converted');
  }

  _this.complete = function(errors, total){
    if(errors.length > 0)
      return logger.info('Finished with errors: ', errors);

    logger.info('Finished without errors');
  }

  logger.level = options.level ? options.level : 0;
};

TiffConverter.prototype.createDir = function(target, filename, cb){
  fs.exists(target, function(exists) {
    if (exists) {
      logger.title(filename, 'exists');
      return cb();
    }
    logger.title(filename, 'created');
    fs.mkdir(target, '0755', cb);
  });
}

TiffConverter.prototype.count = function(converted, key, value){
  var num = 0;
  for(var i = 0; i < converted.length; i++){
    if(converted[i][key] === value){
      num++;
    }
  }
  return num;
}

TiffConverter.prototype.convert = function(){

  var _this = this,
    page = _this.options.page ? _this.options.page + "+0+0" : 'A4+0+0',
    type = _this.options.type ? _this.options.type : 'png';

  var original = _this.tiffs[_this.converted.length];

  var filenameRegex = new RegExp('([^\\|\/]*(?=[.][a-zA-Z]+$))', 'g'),
    filename = original.match(filenameRegex)[0];
    target = _this.location + '/' + filename;

  // Create the directory
  try {

    _this.createDir(target, filename, function(err){

      if(err) logger.error(err);

      exec('convert ' + original + ' -scene 1 ' + target + '/page%d.' + _this.options.type, function(err, stdout, stderr){

        if(err){
          logger.tabbed('Converted', false);
          _this.errors.push({
            target: target,
            error: err
          });
        }else{
          logger.tabbed('Conversion', true);
        }

        _this.converted.push({
          original: original,
          target: target,
          success: !err ? true : false
        });

        if(_this.converted.length === _this.total){
          // All of the Tiffs have been converted
          logger.space();
          logger.success(_this.count(_this.converted, 'success', true) + ' Converted.');
          logger.fail(_this.count(_this.converted, 'success', false) + ' Failed.');
          logger.space();

          if(_this.errors.length > 0){
            _this.errors.forEach(function(error){
              logger.debugError(error.target, error.error);
              logger.space();
            });
          }

          return _this.complete(_this.errors, _this.total);
        }

        _this.progress(_this.converted, _this.total);
        _this.convert();

      });

    });

  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }

};

TiffConverter.prototype.convertArray = function(tiffs, location){

  var _this = this;

  // Reset all variables
  _this.converted = [];
  _this.errors = [];

  /**
   * Call the convert method with a callback
   * which will call the convert until it is
   * complete
   */
  _this.total = tiffs.length;
  _this.location = location;
  _this.tiffs = tiffs;
  _this.convert();

};

module.exports = TiffConverter;
