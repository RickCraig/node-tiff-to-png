/**
 * A simple helper for logging info & errors
 */

 module.exports = {
  /**
   * Log Levels:
   * 0: Error only
   * 1: Info and Error
   */
  level: 0,
  padding: '  ',
  info: function(message) {
    if(this.level < 1) return;
    console.log('\x1b[36mInfo: \x1b[0m%s', message);
  },
  error: function(message) {
    console.log('\x1b[31mError: \x1b[0m%s', message);
  },
  title: function(title, comment){
    var formattedComment = comment ? '\x1B[90m (' + comment + ')\x1B[39m' : '';
    console.log('\n\n' + this.padding + '%s%s', title, formattedComment);
  },
  tabbed: function(message, success){
    var result = success ? '\x1B[32m✓\x1B[39m' : '\x1B[31m✗\x1B[39m';
    var colorStart = success ? '\x1B[90m' : '\x1B[31m';
    console.log(this.padding + ' ' + ' %s ' + colorStart + '%s\x1B[39m', result, message);
  },
  success: function(message){
    console.log(this.padding + '\x1B[32m%s\x1B[39m', message);
  },
  fail: function(message){
    console.log(this.padding + '\x1b[31m%s\x1b[0m', message);
  },
  space: function(){
    console.log('\n');
  },
  debugError: function(target, stack){
    console.log('\x1b[31m%s\x1b[0m', target);
    console.log('\x1B[90m%s\x1B[39m', stack);
  }
 }
