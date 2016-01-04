var ConvertTiff = require('../lib/convert'),
  childProcess = require('child_process'),
  logger = require('../lib/logger'),
  should = require('chai').should(),
  fs = require('fs'),
  sinon = require('sinon');

describe('Convert: #tiff-to-png', function(){

  var options = {
    page: 'A4',
    type: 'png',
    logLevel: 0
  };

  describe('Initialise', function(){

    it('Should initialise without any errors when no options are passed', function(){
      var converter = new ConvertTiff();
    });

    it('Should initialise without any error when options are passed', function(){
      var converter = new ConvertTiff({
        page: 'A4',
        type: 'png',
        logLevel: 1
      });
    });

    it('Should set all the required variables and callbacks', function(){
      var converter = new ConvertTiff(options);

      converter.converted.should.be.a('array');
      converter.total.should.equal(0);
      converter.location.should.equal('');
      converter.tiffs.should.be.a('array');
      converter.options.should.equal(options);
      converter.errors.should.be.a('array');
      converter.progress.should.be.a('function');
      converter.complete.should.be.a('function');
    });

  });

  describe('Callbacks', function(){

    it('Should log an error by default on completion with errors', function(done){
      var loggerStub = sinon.stub(logger, 'error', function(message){
        message.should.not.be.null;
        loggerStub.restore();
        done();
      });
      var converter = new ConvertTiff(options);
      converter.complete([{error: 'test'}], 2);
    });

  });

  describe('Utilities', function(){
    describe('Create Directory', function(){

      it('Should skip the creation of a directory when it exists', function(done){
        var loggerStub = sinon.stub(logger, 'title');
        var existsCheckStub = sinon.stub(fs, 'exists').yields(true);
        var mkdirMock = sinon.mock(fs);
        var expectation = mkdirMock
          .expects('mkdir')
          .never();

        var converter = new ConvertTiff(options);
        converter.createDir('/test', 'test', function(){
          loggerStub.restore();
          existsCheckStub.restore();
          expectation.verify();
          mkdirMock.restore();
          done();
        });
      });

      it('Should create a directory when the folder doesn\'t exist', function(done){
        var loggerStub = sinon.stub(logger, 'title');
        var existsCheckStub = sinon.stub(fs, 'exists').yields(false);
        var mkdirMock = sinon.mock(fs);
        var expectation = mkdirMock
          .expects('mkdir')
          .once()
          .yields();

        var converter = new ConvertTiff(options);
        converter.createDir('/test', 'test', function(){
          loggerStub.restore();
          existsCheckStub.restore();
          expectation.verify();
          mkdirMock.restore();
          done();
        });
      })

    });

    describe('Count', function(){

      it('Should count the number of objects in an array with a key that equals a value', function(){
        var converter = new ConvertTiff(options);
        var objects = [
          {test: 'foo'},
          {test: 'foo'},
          {test: 'oof'}
        ];
        var total = converter.count(objects, 'test', 'foo');
        total.should.equal(2);
      });

    });
  });

  describe('Convert', function(){

    it('Should set the file type to png by default when type is not passed', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        createDirStub.restore();
        execStub.restore();
        command.should.contain('.png');
        done();
      });

      var converter = new ConvertTiff({});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.convert();

    });

    it('Should set the file type to the file type passed', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        createDirStub.restore();
        execStub.restore();
        command.should.contain('.jpg');
        done();
      });

      var converter = new ConvertTiff({type: 'jpg'});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.convert();

    });

    it('Should set the prefix to "page" by default when prefix is not passed', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        createDirStub.restore();
        execStub.restore();
        command.should.contain('page');
        done();
      });

      var converter = new ConvertTiff({});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.convert();

    });

    it('Should set the prefix when prefix is passed', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        createDirStub.restore();
        execStub.restore();
        command.should.contain('pagefoo');
        done();
      });

      var converter = new ConvertTiff({
        prefix: 'pagefoo'
      });
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.convert();

    });

    it('Should set the suffix to "" by default when suffix is not passed', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        createDirStub.restore();
        execStub.restore();
        command.should.contain('page%d.png');
        done();
      });

      var converter = new ConvertTiff({});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.convert();

    });

    it('Should set the suffix when suffix is passed', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        createDirStub.restore();
        execStub.restore();
        command.should.contain('_foo');
        done();
      });

      var converter = new ConvertTiff({
        suffix: '_foo'
      });
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.convert();

    });

    it('Should log an error when there is a problem with the creation of a directory', function(done){
      var error = 'Test Error';
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb(error);
      });

      var loggerStub = sinon.stub(logger, 'error', function(message){
        createDirStub.restore();
        loggerStub.restore();
        message.should.equal(error);
        done();
      });

      var converter = new ConvertTiff({type: 'jpg'});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.convert();

    });

    it('Should add an error to the errors array when conversion fails', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        cb('Test Error');
      });

      var converter = new ConvertTiff({type: 'jpg'});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.complete = function(errors, total){
        createDirStub.restore();
        execStub.restore();
        converter.errors.length.should.equal(1);
        done();
      }
      converter.convert();

    });

    it('Should add the converted file with the outcome to the converted array when failed', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        cb('Test Error');
      });

      var converter = new ConvertTiff({type: 'jpg'});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.complete = function(errors, total){
        createDirStub.restore();
        execStub.restore();
        converter.converted.length.should.equal(1);
        converter.converted[0].success.should.be.false;
        done();
      }
      converter.convert();

    });

    it('Should add the converted file with the outcome to the converted array when successful', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        cb();
      });

      var converter = new ConvertTiff({type: 'jpg'});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';
      converter.complete = function(errors, total){
        createDirStub.restore();
        execStub.restore();
        converter.converted.length.should.equal(1);
        converter.converted[0].success.should.be.true;
        done();
      }
      converter.convert();

    });

    it('Should call the progress callback when a single file has completed', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        cb('Test Error');
      });

      var called = 0;

      var converter = new ConvertTiff({type: 'jpg'});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';

      converter.progress = function(converted, total){
        called++;
      };

      converter.complete = function(errors, total){
        createDirStub.restore();
        execStub.restore();
        called.should.equal(1);
        done();
      }

      converter.convert();

    });

    it('Should call the complete callback when the array is complete', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        cb();
      });

      var converter = new ConvertTiff({type: 'jpg'});
      converter.tiffs = ['/test/foo.tif'];
      converter.total = 1;
      converter.location = './public';

      converter.complete = function(errors, total){
        createDirStub.restore();
        execStub.restore();
        done();
      }

      converter.convert();

    });

    it('Should run convert again once a file has been converted', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        cb();
      });

      var convertSpy = sinon.spy(ConvertTiff.prototype, 'convert');

      var converter = new ConvertTiff({type: 'jpg'});
      converter.tiffs = ['/test/foo.tif', '/test/foo.tif'];
      converter.total = 2;
      converter.location = './public';

      converter.complete = function(errors, total){
        createDirStub.restore();
        execStub.restore();
        convertSpy.callCount.should.equal(2);
        convertSpy.restore();
        done();
      }

      converter.convert();

    });

    it('Should pass the temporary path when tmpPath option is set', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        command.should.contain('/path/to/tmp');
        cb();
      });

      var convertSpy = sinon.spy(ConvertTiff.prototype, 'convert');

      var converter = new ConvertTiff({ tmpPath: '/path/to/tmp' });
      converter.tiffs = ['/test/foo.tif', '/test/foo.tif'];
      converter.total = 2;
      converter.location = './public';

      converter.complete = function(errors, total){
        createDirStub.restore();
        execStub.restore();
        convertSpy.callCount.should.equal(2);
        convertSpy.restore();
        done();
      }

      converter.convert();

    });

    it('Should attempt to clear all files named magick-* from the tmpPath', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        cb();
      });

      var readDirStub = sinon.stub(fs, 'readdir', function(path, cb) {
        cb(null, ['./magick-bla.ext']);
      });

      var unlinkStub = sinon.stub(fs, 'unlink', function(path) {
        path.should.contain('magick-bla.ext');
      });

      var convertSpy = sinon.spy(ConvertTiff.prototype, 'convert');

      var converter = new ConvertTiff({ tmpPath: '/path/to/tmp', autoRemoveTmp: true });
      converter.tiffs = ['/test/foo.tif', '/test/foo.tif'];
      converter.total = 2;
      converter.location = './public';

      converter.complete = function(errors, total){
        createDirStub.restore();
        execStub.restore();
        readDirStub.restore();
        unlinkStub.restore();
        convertSpy.callCount.should.equal(2);
        convertSpy.restore();
        done();
      }

      converter.convert();

    });

    it('Should log an error when an error occurs checking the tmp directory', function(done){
      var createDirStub = sinon.stub(ConvertTiff.prototype, 'createDir', function(target, filename, cb){
        cb();
      });

      var execStub = sinon.stub(childProcess, 'exec', function(command, cb){
        cb();
      });

      var error = new Error('Test Error');
      var readDirStub = sinon.stub(fs, 'readdir', function(path, cb) {
        cb(error, []);
      });

      var loggerStub = sinon.stub(logger, 'error', function(message){
        createDirStub.restore();
        execStub.restore();
        loggerStub.restore();
        readDirStub.restore();
        message.should.equal(error);
        done();
      });

      var convertSpy = sinon.spy(ConvertTiff.prototype, 'convert');

      var converter = new ConvertTiff({ tmpPath: '/path/to/tmp', autoRemoveTmp: true });
      converter.tiffs = ['/test/foo.tif', '/test/foo.tif'];
      converter.total = 2;
      converter.location = './public';

      converter.complete = function(errors, total){
        convertSpy.callCount.should.equal(2);
        convertSpy.restore();
      }

      converter.convert();

    });

  });



  describe('Convert Array', function(){
    it('Should log an error when the array of tiffs is null', function(done){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert');
      var loggerStub = sinon.stub(logger, 'error', function(message){
        convertStub.restore();
        loggerStub.restore();
        message.should.equal('An array of tiffs is required');
        done();
      });

      var converter = new ConvertTiff();
      converter.convertArray();
    });

    it('Should log an error when the array of tiffs is empty', function(done){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert');
      var loggerStub = sinon.stub(logger, 'error', function(message){
        convertStub.restore();
        loggerStub.restore();
        message.should.equal('An array of tiffs is required');
        done();
      });

      var converter = new ConvertTiff();
      converter.convertArray([]);
    });

    it('Should log an error when the location is null', function(done){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert');
      var loggerStub = sinon.stub(logger, 'error', function(message){
        convertStub.restore();
        loggerStub.restore();
        message.should.equal('The location folder is required');
        done();
      });

      var converter = new ConvertTiff();
      converter.convertArray(['./test/foo.tif']);
    });

    it('Should log an error when the location is empty', function(done){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert');
      var loggerStub = sinon.stub(logger, 'error', function(message){
        convertStub.restore();
        loggerStub.restore();
        message.should.equal('The location folder is required');
        done();
      });

      var converter = new ConvertTiff();
      converter.convertArray(['./test/foo.tif'], '');
    });

    it('Should reset all variables related to the conversion', function(){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert');

      var converter = new ConvertTiff();
      converter.converted = [
        'foo1', 'foo2'
      ];
      converter.errors = [
        'error1', 'error2'
      ];

      converter.convertArray(['./test/foo.tif'], './public');

      converter.converted.length.should.be.zero;
      converter.errors.length.should.be.zero;
      convertStub.restore();
    });

    it('Should set the instance variable "tiffs"', function(){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert');

      var converter = new ConvertTiff();

      converter.convertArray(['./test/foo.tif'], './public');

      converter.tiffs.length.should.equal(1);
      convertStub.restore();
    });

    it('Should set the location', function(){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert');

      var converter = new ConvertTiff();

      converter.convertArray(['./test/foo.tif'], './public');

      converter.location.should.equal('./public');
      convertStub.restore();
    });

    it('Should set the total to the length of the array', function(){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert');

      var converter = new ConvertTiff();

      converter.convertArray(['./test/foo.tif'], './public');

      converter.total.should.equal(1);
      convertStub.restore();
    });

    it('Should call convert after reset', function(done){
      var convertStub = sinon.stub(ConvertTiff.prototype, 'convert', function(){
        convertStub.restore();
        done();
      });

      var converter = new ConvertTiff();

      converter.convertArray(['./test/foo.tif'], './public');
    });
  });

});
