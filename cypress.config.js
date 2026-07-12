const { defineConfig } = require("cypress");
const path = require("path");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node events here
    },
    supportFile: false,
  },
});
