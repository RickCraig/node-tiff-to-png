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
  error(message) {
    console.log('\x1b[31mError: \x1b[0m%s', message);
  },
  title(title, comment) {
    if (this.level < 1) return;
    const formattedComment = comment ? `\x1B[90m (${comment})\x1B[39m` : '';
    console.log(`\n\n${this.padding}%s%s`, title, formattedComment);
  },
  tabbed(message, success) {
    if (this.level < 1) return;
    const result = success ? '\x1B[32m✓\x1B[39m' : '\x1B[31m✗\x1B[39m';
    const colorStart = success ? '\x1B[90m' : '\x1B[31m';
    console.log(`${this.padding} %s ${colorStart}%s\x1B[39m`, result, message);
  },
  success(message) {
    if (this.level < 1) return;
    console.log(`${this.padding}\x1B[32m%s\x1B[39m`, message);
  },
  fail(message) {
    if (this.level < 1) return;
    console.log(`${this.padding}\x1b[31m%s\x1b[0m`, message);
  },
  space() {
    if (this.level < 1) return;
    console.log('\n');
  },
  debugError(target, stack) {
    if (this.level < 1) return;
    console.log('\x1b[31m%s\x1b[0m', target);
    console.log('\x1B[90m%s\x1B[39m', stack);
  }
};
