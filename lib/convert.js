const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Options:
 * page: 'A4', 'A3'
 * type: 'png', 'jpg'
 * logLevel: 1 = info, 0, error (default)
 * tmpPath: '/path/to/tmp' (optional),
 * autoRemoveTmp: true, false (default)
 * scene: 1, 2 or undefined (default)
 */

class TiffConverter {
  constructor(options) {
    this.location = '';
    this.options = options || {};

    this.progress = () => {};
    this.complete = errors => {
      if (errors.length && this.options.logLevel === 0) {
        return logger.error(errors);
      }
    };

    logger.level = this.options.logLevel || 0;
  }

  static createDir(target, filename) {
    return new Promise((resolve, reject) => {
      fs.exists(target, exists => {
        if (exists) {
          logger.title(filename, 'exists');
          return resolve();
        }
        logger.title(filename, 'created');
        fs.mkdir(target, '0755', err => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  static count(converted, key, value) {
    if (!Array.isArray(converted)) return converted.success === value ? 1 : 0;

    let num = 0;
    const keys = Object.keys(converted);
    keys.forEach(i => {
      if (converted[i][key] === value) num += 1;
    });
    return num;
  }

  static call(command) {
    return new Promise((resolve, reject) => {
      childProcess.exec(command, err => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  }

  unlink(file) {
    return new Promise(resolveUnlink => {
      if (!/magick-/.test(file)) return resolveUnlink();
      fs.unlink(`${this.options.tmpPath}/${file}`, () => resolveUnlink());
    });
  }

  removePaths() {
    return new Promise(resolve => {
      fs.readdir(this.options.tmpPath, async (err, files) => {
        if (err) {
          logger.error(err);
          return resolve();
        }
        await Promise.all(files.map(this.unlink.bind(this)));
        resolve();
      });
    });
  }

  async onComplete(errors, converted, total) {
    // Let the command line know
    logger.space();
    logger.success(`${TiffConverter.count(converted, 'success', true)} Converted.`);
    logger.fail(`${TiffConverter.count(converted, 'success', false)} Failed.`);
    logger.space();

    // Log out any errors that occurred during the process
    errors.forEach(error => {
      logger.debugError(error.target, error.error);
      logger.space();
    });

    if (this.options.tmpPath && this.options.autoRemoveTmp) await this.removePaths();
    this.complete(errors, converted, total);
  }

  async convert(tiff, isArray, location) {
    const type = this.options.type || 'png';
    const prefix = this.options.prefix || '';
    const suffix = this.options.suffix || '';
    const filename = path.basename(tiff, path.extname(tiff));

    let target = `${location}/${filename}`;
    if (this.options.saveFolder) target = `${location}/${this.options.saveFolder}`;

    if (!location) {
      logger.title(filename, 'saved');
      target = path.dirname(tiff);
    } else {
      // Create the directory (if it doesn't already exist)
      await TiffConverter.createDir(target, filename);
    }

    let command = this.options.commandPath || 'convert';

    const escapeSpaces = pathWithSpaces => pathWithSpaces.replace(/(\s+)/g, '\\$1');

    if (this.options.tmpPath) {
      command += ` -define registry:temporary-path=${escapeSpaces(this.options.tmpPath)}`;
    }

    let targetPath = `${target}/${prefix}%d${suffix}.${type}`;
    if (isArray && !location) targetPath = `${target}/${prefix}${filename}_%d${suffix}.${type}`;
    command += ` ${escapeSpaces(tiff)}`;
    if (this.options.scene) command += ` -scene ${this.options.scene}`;
    command += ` ${escapeSpaces(targetPath)}`;

    let success = false;
    let error;
    try {
      success = await TiffConverter.call(command);
      logger.tabbed('Successful conversion', true);
    } catch (e) {
      logger.tabbed('Conversion failed', false);
      error = {
        tiff, target, filename: targetPath, error: e
      };
    }

    const converted = {
      tiff, target, success, filename: targetPath
    };
    return { converted, error };
  }

  async convertOne(tiff, location) {
    if (!tiff || tiff.length === 0) return logger.error('A tiff is required');

    const total = 1;
    const { converted, error } = await this.convert(tiff, false, location);
    const errors = error ? [error] : [];
    this.progress([converted], total);
    this.onComplete(errors, converted, total);
    return { errors, converted, total };
  }

  async convertArray(tiffs, location) {
    if (!tiffs || tiffs.length === 0) return logger.error('An array of tiffs is required');

    /**
     * Call the convert method with a callback
     * which will call the convert until it is
     * complete
     */
    const total = tiffs.length;
    const all = [];
    const errors = [];
    await tiffs.reduce((p, tiff) => p.then(async () => {
      const { converted, error } = await this.convert(tiff, true, location);
      if (error) errors.push(error);
      all.push(converted);
      this.progress(all, total);
    }), Promise.resolve());

    this.onComplete(errors, all, total);
    return { errors, converted: all, total };
  }
}

module.exports = TiffConverter;
