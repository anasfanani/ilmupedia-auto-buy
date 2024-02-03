const { join } = require('path');

let config = {};

if (process.env.PREFIX === '/data/data/com.termux/files/usr') {
    config.executablePath = '/data/data/com.termux/files/usr/bin/chromium-browser';
}

config.cacheDirectory = join(__dirname, '.cache', 'puppeteer');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = config;