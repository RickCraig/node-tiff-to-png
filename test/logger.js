var should = require('chai').should(),
  sinon = require('sinon');

describe('Logger: #tiff-to-png', function(){

  it('Should be set to a log level of 0 by default', function(){
    var logger = require('../lib/logger');
    logger.level.should.equal(0);
  });

  it('Should log an error at any log level', function(){
    var logger = require('../lib/logger');
    var spy = sinon.spy(console, 'log');

    logger.error('Logging test error at 0');
    logger.level = 1;
    logger.error('Logging test error at 1');
    spy.calledTwice.should.be.true;
    spy.restore();
  });

  it('Should only show titles when the level is set to 1', function(){
    var logger = require('../lib/logger');
    var spy = sinon.spy(console, 'log');
    logger.level = 0;
    logger.title('Logging test title at 0');
    logger.level = 1;
    logger.title('Logging test title at 1');
    spy.calledOnce.should.be.true;
    spy.restore();
  });

  it('Should only show tabbed when the level is set to 1', function(){
    var logger = require('../lib/logger');
    var spy = sinon.spy(console, 'log');
    logger.level = 0;
    logger.tabbed('Logging test tabbed content at 0');
    logger.level = 1;
    logger.tabbed('Logging test tabbed content at 1');
    spy.calledOnce.should.be.true;
    spy.restore();
  });

  it('Should only show success when the level is set to 1', function(){
    var logger = require('../lib/logger');
    var spy = sinon.spy(console, 'log');
    logger.level = 0;
    logger.success('Logging test success at 0');
    logger.level = 1;
    logger.success('Logging test success at 1');
    spy.calledOnce.should.be.true;
    spy.restore();
  });

  it('Should only show fail when the level is set to 1', function(){
    var logger = require('../lib/logger');
    var spy = sinon.spy(console, 'log');
    logger.level = 0;
    logger.fail('Logging test fail at 0');
    logger.level = 1;
    logger.fail('Logging test fail at 1');
    spy.calledOnce.should.be.true;
    spy.restore();
  });

  it('Should only show space when the level is set to 1', function(){
    var logger = require('../lib/logger');
    var spy = sinon.spy(console, 'log');
    logger.level = 0;
    logger.space();
    logger.level = 1;
    logger.space();
    spy.calledOnce.should.be.true;
    spy.restore();
  });

  it('Should only show a debug error when the level is set to 1', function(){
    var logger = require('../lib/logger');
    var spy = sinon.spy(console, 'log');
    logger.level = 0;
    logger.debugError('./test/foo', 'logging test debug error at 0');
    logger.level = 1;
    logger.debugError('./test/foo', 'logging test debug error at 0');
    spy.calledTwice.should.be.true;
    spy.restore();
  });

});
