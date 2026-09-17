// Same suite against the published GitHub Pages build: npx playwright test -c playwright.live.config.js
const base = require('./playwright.config.js');
module.exports = { ...base, webServer: undefined, use: { ...base.use, baseURL: 'https://zsoltipi-ux.github.io/smilestone-landing-2026/' } };
