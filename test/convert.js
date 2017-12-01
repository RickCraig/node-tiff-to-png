const ConvertTiff = require('../lib/convert'),
  childProcess = require('child_process'),
  logger = require('../lib/logger'),
  should = require('chai').should(),
  fs = require('fs'),
  sinon = require('sinon');

describe('Convert: #tiff-to-png', () => {

  const options = {
    page: 'A4',
    type: 'png',
    logLevel: 0
  };

  let sandbox;
  beforeEach(() => sandbox = sinon.sandbox.create());
  afterEach(() => sandbox.restore());

  describe('Initialise', () => {

    it('Should initialise without any errors when no options are passed', () => {
      const converter = new ConvertTiff();
    });

    it('Should initialise without any error when options are passed', () => {
      const converter = new ConvertTiff({
        page: 'A4',
        type: 'png',
        logLevel: 1
      });
    });

    it('Should set all the required variables and callbacks', () => {
      const converter = new ConvertTiff(options);
      converter.options.should.equal(options);
      converter.progress.should.be.a('function');
      converter.complete.should.be.a('function');
    });

  });

  describe('Callbacks', () => {

    it('Should log an error by default on completion with errors', () => {
      const mock = sandbox.mock(logger)
        .expects('error')
        .withArgs(sinon.match.defined);
      const converter = new ConvertTiff(options);
      converter.complete([{ error: 'test' }], 2);
      mock.verify();
    });

  });

  describe('Utilities', () => {
    describe('Create Directory', () => {

      it('Should skip the creation of a directory when it exists', async () => {
        sandbox.stub(logger, 'title');
        sandbox.stub(fs, 'exists').yields(true);
        const mock = sandbox.mock(fs)
          .expects('mkdir')
          .never();

        await ConvertTiff.createDir('/test', 'test');
        mock.verify();
      });

      it('Should create a directory when the folder doesn\'t exist', async () => {
        sandbox.stub(logger, 'title');
        sandbox.stub(fs, 'exists').yields(false);
        const mock = sandbox.mock(fs)
          .expects('mkdir')
          .once()
          .yields();

        await ConvertTiff.createDir('/test', 'test');
        mock.verify();
      });

      it('Should reject if an error occurs during creation', async () => {
        sandbox.stub(fs, 'mkdir').callsFake((path, chmod, cb) => cb('error'));
        try {
          await ConvertTiff.createDir('/test', 'test');
        } catch (e) {
          String(e).should.equal('error');
        }
      });

    });

    describe('Count', () => {

      it('Should count the number of objects in an array with a key that equals a value', () => {
        const objects = [
          { test: 'foo' },
          { test: 'foo' },
          { test: 'oof' }
        ];
        const total = ConvertTiff.count(objects, 'test', 'foo');
        total.should.equal(2);
      });

    });

    describe('Call', () => {

      it('should call childProcess.exec', async () => {
        const command = 'test command';
        const mock = sandbox.mock(childProcess)
          .expects('exec')
          .withArgs(command)
          .yields();

        await ConvertTiff.call(command);
        mock.verify();
      });

      it('should call reject on exec error', async () => {
        const command = 'test command';
        sandbox.stub(childProcess, 'exec').yields('test error');

        try {
          await ConvertTiff.call(command);
        } catch (e) {
          String(e).should.equal('test error');
        }
      });

    });

    describe('RemovePaths', () => {

      it('should skip any files/folders without the magick- prefix', async () => {
        const mock = sandbox.mock(fs)
          .expects('unlink')
          .never();
        sandbox.stub(fs, 'readdir').callsFake((path, cb) => {
          cb(null, ['./random']);
        });

        const converter = new ConvertTiff(options);
        await converter.removePaths();
        mock.verify();
      });

      it('Should log an error when the read dir fails', async () => {
        const error = new Error('test');
        sandbox.stub(fs, 'readdir').callsFake((path, cb) => {
          cb(error);
        });
        const mock = sandbox.mock(logger)
          .expects('error')
          .withArgs(sinon.match(error));

        const converter = new ConvertTiff(options);
        await converter.removePaths();
        mock.verify();
      });

      it('Should call unlink on any relevant files', async () => {
        const mock = sandbox.mock(fs)
          .expects('unlink')
          .twice()
          .yields();
        sandbox.stub(fs, 'readdir').callsFake((path, cb) => {
          cb(null, ['./magick-one', './magick-two']);
        });

        const converter = new ConvertTiff(options);
        await converter.removePaths();
        mock.verify();
      });

    });
  });

  describe('Convert', () => {

    it('should use the saveFolder option when set', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('/test_save'));

      const converter = new ConvertTiff({ saveFolder: '/test_save' });
      await converter.convert('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('Should set the file type to png by default when type is not passed', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('.png'));

      const converter = new ConvertTiff({});
      await converter.convert('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('Should set the file type to the file type passed', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('.jpg'));

      const converter = new ConvertTiff({ type: 'jpg' });
      await converter.convert('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('Should add the scene when passed', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('-scene 1'));

      const converter = new ConvertTiff({ scene: 1 });
      await converter.convert('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('should save in the place when no location is passed', async () => {
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('/test/%d.png'));

      const converter = new ConvertTiff({ type: 'png' });
      await converter.convert('/test/foo.tif');
      mock.verify();
    });

    it('Should set the prefix when prefix is passed', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('pagefoo'));

      const converter = new ConvertTiff({ prefix: 'pagefoo' });
      await converter.convert('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('Should set the suffix to "" by default when suffix is not passed', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('%d.png'));

      const converter = new ConvertTiff({});
      await converter.convert('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('Should set the suffix when suffix is passed', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('_foo'));

      const converter = new ConvertTiff({ suffix: '_foo' });
      await converter.convert('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('Should throw an error when there is a problem with the creation of a directory', async () => {
      const error = 'Test Error';
      sandbox.stub(ConvertTiff, 'createDir').rejects(error);

      const converter = new ConvertTiff({ type: 'jpg' });
      try {
        await converter.convert('/test/foo.tif', false, './public');
      } catch (e) {
        String(e).should.equal(error);
      }
    });

    it('Should return the converted file with the outcome when failed', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      sandbox.stub(ConvertTiff, 'call').rejects('Test Error');

      const converter = new ConvertTiff({ type: 'jpg' });
      const { converted } = await converter.convert('/test/foo.tif', false, './public');
      converted.success.should.equal(false);
    });

    it('Should return the converted file with the outcome when successful', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      sandbox.stub(ConvertTiff, 'call').resolves(true);

      const converter = new ConvertTiff({ type: 'jpg' });
      const { converted } = await converter.convert('/test/foo.tif', false, './public');
      converted.success.should.equal(true);
    });

    it('Should pass the temporary path when tmpPath option is set', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('/path/to/tmp'));

      const converter = new ConvertTiff({ tmpPath: '/path/to/tmp' });
      await converter.convert('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('Should throw an error when an error occurs checking the tmp directory', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      sandbox.stub(ConvertTiff, 'call').resolves();

      const error = new Error('Test Error');
      sandbox.stub(fs, 'readdir').callsFake((path, cb) => {
        cb(error, []);
      });

      const converter = new ConvertTiff({ tmpPath: '/path/to/tmp', autoRemoveTmp: true });

      try {
        await converter.convert('/test/foo.tif', false, './public');
      } catch (e) {
        e.should.equal(error);
      }
    });

    it('should prepend the filename when an array and no location is passed', async () => {
      sandbox.stub(ConvertTiff, 'createDir').resolves();
      const mock = sandbox.mock(ConvertTiff)
        .expects('call')
        .withArgs(sinon.match('foo_%d'));

      const converter = new ConvertTiff({ tmpPath: '/path/to/tmp' });
      await converter.convert('/test/foo.tif', true);
      mock.verify();
    });
  });

  describe('ConvertOne', () => {
    it('Should log an error when the tiff is null', async () => {
      const mock = sandbox.mock(logger)
        .expects('error')
        .withArgs('A tiff is required');

      const converter = new ConvertTiff();
      await converter.convertOne();
      mock.verify();
    });

    it('Should log an error when the tiff is an empty string', async () => {
      const mock = sandbox.mock(logger)
        .expects('error')
        .withArgs('A tiff is required');

      const converter = new ConvertTiff();
      await converter.convertOne('');
      mock.verify();
    });

    it('Should call convert', async () => {
      const mock = sandbox.mock(ConvertTiff.prototype)
        .expects('convert')
        .resolves({ converted: {}, error: null });
      const converter = new ConvertTiff();
      await converter.convertOne('./test/foo.tif', './public');
      mock.verify();
    });

    it('Should call the progress callback when a single file has completed', async () => {
      sandbox.stub(ConvertTiff.prototype, 'convert').resolves({ converted: {}, error: null });

      const converter = new ConvertTiff({ type: 'jpg' });
      const spy = sandbox.spy(converter, 'progress');
      await converter.convertOne('/test/foo.tif', false, './public');
      spy.callCount.should.equal(1);
    });

    it('Should call the complete callback when the convert is complete', async () => {
      sandbox.stub(ConvertTiff.prototype, 'convert').resolves({ converted: {}, error: null });

      const converter = new ConvertTiff({ type: 'jpg' });
      const spy = sandbox.spy(converter, 'complete');
      await converter.convertOne('/test/foo.tif', false, './public');
      spy.callCount.should.equal(1);
    });

    it('Should attempt to clear all files named magick-* from the tmpPath', async () => {
      sandbox.stub(ConvertTiff.prototype, 'convert').resolves({ converted: {}, error: null });
      sandbox.stub(fs, 'readdir').callsFake((path, cb) => {
        cb(null, ['./magick-bla.ext']);
      });
      const mock = sandbox.mock(fs)
        .expects('unlink')
        .withArgs(sinon.match('magick-bla.ext'));

      const converter = new ConvertTiff({ tmpPath: '/path/to/tmp', autoRemoveTmp: true });
      await converter.convertOne('/test/foo.tif', false, './public');
      mock.verify();
    });

    it('Should pass the error through on complete', async () => {
      const error = new Error('test');
      sandbox.stub(ConvertTiff.prototype, 'convert').resolves({ converted: {}, error });
      const converter = new ConvertTiff();
      const { errors } = await converter.convertOne('./test/foo.tif', './public');
      errors.length.should.equal(1);
      errors[0].should.equal(error);
    });

    it('should return info on the converted on complete', async () => {
      sandbox.stub(ConvertTiff.prototype, 'convert')
        .resolves({ converted: { test: true }, error: null });
      const converter = new ConvertTiff();
      const { converted } = await converter.convertOne('./test/foo.tif', './public');
      converted.should.eql({ test: true });
    });
  });

  describe('Convert Array', () => {
    it('Should log an error when the array of tiffs is null', async () => {
      const mock = sandbox.mock(logger)
        .expects('error')
        .withArgs('An array of tiffs is required');

      const converter = new ConvertTiff();
      await converter.convertArray();
      mock.verify();
    });

    it('Should log an error when the array of tiffs is empty', async () => {
      const mock = sandbox.mock(logger)
        .expects('error')
        .withArgs('An array of tiffs is required');

      const converter = new ConvertTiff();
      await converter.convertArray([]);
      mock.verify();
    });

    it('Should call convert', async () => {
      const mock = sandbox.mock(ConvertTiff.prototype)
        .expects('convert')
        .resolves({ converted: {}, error: null });
      const converter = new ConvertTiff();
      await converter.convertArray(['./test/foo.tif'], './public');
      mock.verify();
    });

    it('Should call the progress callback when a file has completed', async () => {
      sandbox.stub(ConvertTiff.prototype, 'convert').resolves({ converted: {}, error: null });

      const converter = new ConvertTiff({ type: 'jpg' });
      const spy = sandbox.spy(converter, 'progress');
      await converter.convertArray(['/test/foo.tif', '/test/foo1.tif'], './public');
      spy.callCount.should.equal(2);
    });

    it('Should call the complete callback when the array is complete', async () => {
      sandbox.stub(ConvertTiff.prototype, 'convert').resolves({ converted: {}, error: null });

      const converter = new ConvertTiff({ type: 'jpg' });
      const spy = sandbox.spy(converter, 'complete');
      await converter.convertArray(['/test/foo.tif'], './public');
      spy.callCount.should.equal(1);
    });

    it('Should attempt to clear all files named magick-* from the tmpPath', async () => {
      sandbox.stub(ConvertTiff.prototype, 'convert').resolves({ converted: {}, error: null });
      sandbox.stub(fs, 'readdir').callsFake((path, cb) => {
        cb(null, ['./magick-bla.ext']);
      });
      const mock = sandbox.mock(fs)
        .expects('unlink')
        .withArgs(sinon.match('magick-bla.ext'));

      const converter = new ConvertTiff({ tmpPath: '/path/to/tmp', autoRemoveTmp: true });
      await converter.convertArray(['/test/foo.tif'], './public');
      mock.verify();
    });

    it('Should pass the errors through on complete', async () => {
      const error = new Error('test');
      sandbox.stub(ConvertTiff.prototype, 'convert').resolves({ converted: {}, error });
      const converter = new ConvertTiff();
      const { errors } = await converter.convertArray(['./test/foo.tif'], './public');
      errors.length.should.equal(1);
      errors[0].should.equal(error);
    });

    it('should return info on the converted on complete', async () => {
      sandbox.stub(ConvertTiff.prototype, 'convert')
        .resolves({ converted: { test: true }, error: null });
      const converter = new ConvertTiff();
      const { converted } = await converter.convertArray(['./test/foo.tif'], './public');
      converted.length.should.equal(1);
      converted[0].should.eql({ test: true });
    });
  });

});
