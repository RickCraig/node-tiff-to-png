var ConvertTiff = require('../lib/convert'),
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

    it('Should default to A4+0+0 when no page size is passed');
    it('Should set the page size when the page size is passed');
    it('Should set the file type to png by default when type is not passed');
    it('Should set the file type to the file type passed');
    it('Should log an error when there is a problem with the creation of a directory');
    it('Should add an error to the errors array when conversion fails');
    it('Should add the converted file with the outcome to the converted array when failed');
    it('Should add the converted file with the outcome to the converted array when successful');
    it('Should call the progress callback when a single file has completed');
    it('Should call the complete callback when the array is complete');

  });

  describe('Convert Array', function(){
    it('Should log an error when the array of tiffs is null');
    it('Should log an error when the array of tiffs is empty');
    it('Should log an error when the location is null');
    it('Should log an error when the location is empty');
    it('Should reset all variables related to the conversion');
    it('Should set the instance variable "tiffs"');
    it('Should set the location');
    it('Should set the total to the length of the array');
    it('Should call convert after reset');
  });

});
