/* eslint-disable no-script-url */
import { describe, expect, it } from 'vitest';
import { isValidURL } from './isValidUrl';

describe('isValidURL', () => {
  it('should return true for valid absolute URLs with allowed protocols', () => {
    const urls = [
      'http://example.com',
      'https://example.com',
      'mailto:test@example.com',
      'tel:+1234567890',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(true);
    });
  });

  it('should return false for absolute URLs with disallowed protocols', () => {
    const urls = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'ftp://example.com',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for absolute URLs with disallowed protocols even when relative', () => {
    const urls = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'ftp://example.com',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url, true), url).toBe(false);
    });
  });

  it('should return true for valid relative URLs when allowRelative is true', () => {
    const urls = ['/relative-path', '/another/relative/path'];

    urls.forEach((url) => {
      expect(isValidURL(url, true), url).toBe(true);
    });
  });

  it('should return false for relative URLs when allowRelative is false', () => {
    const urls = ['/relative-path', '/another/relative/path'];

    urls.forEach((url) => {
      expect(isValidURL(url, false), url).toBe(false);
    });
  });

  it('should return false for double slash relative URLs', () => {
    const urls = ['//example.com', '///example.com'];

    urls.forEach((url) => {
      expect(isValidURL(url, true), url).toBe(false);
    });
  });

  it('should return false for malformed URLs', () => {
    const urls = ['http://', 'https://', '://missing-scheme.com'];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for non-URLs', () => {
    const inputs = ['not a url', '', ' ', 'example.com'];

    inputs.forEach((input) => {
      expect(isValidURL(input)).toBe(false);
    });
  });

  it('should handle base URL and relative URLs correctly', () => {
    const validRelativeURLs = ['/relative-path', '/another/relative/path'];

    validRelativeURLs.forEach((url) => {
      expect(isValidURL(url, true), url).toBe(true);
    });

    const invalidRelativeURLs = ['//example.com', '///example.com'];

    invalidRelativeURLs.forEach((url) => {
      expect(isValidURL(url, true), url).toBe(false);
    });
  });

  // Additional test cases based on provided resources

  it('should return false for URLs with invalid characters', () => {
    const urls = ['http://example.com/\\x00', 'http://example.com/\\x1F'];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for URLs with script injections', () => {
    const urls = [
      'http://example.com/<script>alert("XSS")</script>',
      'http://example.com/\'><script>alert("XSS")</script>',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for URLs with event handlers', () => {
    const urls = [
      '<a href="http://example.com" onmouseover="alert(\'XSS\')">Link</a>',
      '<img src="http://example.com" onerror="alert(\'XSS\')">',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for URLs with data URIs containing scripts', () => {
    const urls = [
      'data:text/html,<script>alert("XSS")</script>',
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" onload="alert(\'XSS\')"/>',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for URLs with vbscript:', () => {
    const urls = ["vbscript:msgbox('XSS')", 'vbscript:alert("XSS")'];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for URLs with unexpected characters', () => {
    const urls = [
      'http://example1.com/|',
      'http://example2.com/\\',
      'http://example4.com/<>',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for URLs with unicode characters that are invalid', () => {
    const urls = ['http://example.com/\\u0000', 'http://example.com/\\u001F'];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for valid data URIs with allowed content types (unsupported)', () => {
    const urls = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      'data:text/plain;charset=UTF-8,Hello%20World!',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for data URIs with disallowed content types', () => {
    const urls = [
      'data:text/html,<script>alert("XSS")</script>',
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" onload="alert(\'XSS\')"/>',
    ];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });

  it('should return false for URLs with control characters', () => {
    const urls = ['http://example.com/\x00', 'http://example.com/\x1F'];

    urls.forEach((url) => {
      expect(isValidURL(url), url).toBe(false);
    });
  });
});
