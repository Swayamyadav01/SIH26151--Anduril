const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
    testDir: './tests', timeout: 45000, workers: 1,
    use: { baseURL: 'http://127.0.0.1:3100', viewport: {width:1440,height:1000},
        launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox','--enable-unsafe-swiftshader'] },
        screenshot: 'only-on-failure' },
    webServer: { command: 'PORT=3100 node server.js', url: 'http://127.0.0.1:3100/api/stats', reuseExistingServer: true },
});
