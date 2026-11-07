// Cypress configuration for E2E tests
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000', // Next.js dev server (proxy through Nginx if needed)
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    video: false,
    screenshotsFolder: false,
  },
};
