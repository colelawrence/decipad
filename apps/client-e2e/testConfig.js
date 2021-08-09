// This is a JS file because jest.config.js needs to import it, besides tests

/**
 * @type string
 */
exports.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4200/';
