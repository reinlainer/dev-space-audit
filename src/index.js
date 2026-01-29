/**
 * dev-space-audit 메인 모듈
 */

const scanner = require('./scanner');
const formatter = require('./formatter');
const { getAllPaths, getPathsByCategory } = require('./paths');
const { formatBytes, getDirectorySize } = require('./utils');

module.exports = {
  scanner,
  formatter,
  paths: {
    getAllPaths,
    getPathsByCategory
  },
  utils: {
    formatBytes,
    getDirectorySize
  }
};
