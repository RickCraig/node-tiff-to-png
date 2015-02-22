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
  info: function(message) {
    if(this.level < 1) return;
    console.log('\x1b[36mInfo: \x1b[0m%s', message);
  },
  error: function(message) {
    console.log('\x1b[31mError: \x1b[0m%s', message);
  },
  title: function(title){
    console.log('\n\n' + title);
  },
  subtitle: function(subtitle){
    console.log('\x1B[90m  \x1B[3m' + subtitle + '\x1B[23m\x1B[39m');
  },
  tabbed: function(message, success){
    var result = success ? '\x1B[32m✓\x1B[39m' : '\x1B[31m✗\x1B[39m'
    console.log('\t%s %s', message, result);
  },
  success: function(message){
    console.log('\x1B[32m%s\x1B[39m', message);
  },
  fail: function(message){
    console.log('\x1b[31m%s\x1b[0m', message);
  }
 }
