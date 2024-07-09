/* eslint-disable no-script-url */
import DOMPurify from 'dompurify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isValidURL } from './isValidUrl';
import { sanitizeInput } from './sanitizeInput';

vi.mock('./isValidUrl');

describe('sanitizeInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return sanitized input if isURL is false', () => {
    const input = '<script>alert("XSS")</script>';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });

  it('should return empty string if isURL is true and URL is invalid', () => {
    const input = 'javascript:alert("XSS")';
    vi.mocked(isValidURL).mockReturnValue(false);

    const result = sanitizeInput({ input, isURL: true });

    expect(isValidURL).toHaveBeenCalledWith(input, false);
    expect(result).toBe('');
  });

  it('should return sanitized URL if isURL is true and URL is valid', () => {
    const input = 'https://example.com';
    vi.mocked(isValidURL).mockReturnValue(true);

    const result = sanitizeInput({ input, isURL: true });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(isValidURL).toHaveBeenCalledWith(input, false);
    expect(result).toBe(sanitizedOutput);
  });

  it('should handle relative URLs correctly when allowRelativeURLs is true', () => {
    const input = '/relative-url';
    vi.mocked(isValidURL).mockReturnValue(true);

    const result = sanitizeInput({
      input,
      isURL: true,
      allowRelativeURLs: true,
    });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(isValidURL).toHaveBeenCalledWith(input, true);
    expect(result).toBe(sanitizedOutput);
  });

  it('should return empty string for relative URLs if allowRelativeURLs is false', () => {
    const input = '/relative-url';
    vi.mocked(isValidURL).mockReturnValue(false);

    const result = sanitizeInput({
      input,
      isURL: true,
      allowRelativeURLs: false,
    });

    expect(isValidURL).toHaveBeenCalledWith(input, false);
    expect(result).toBe('');
  });

  it('should handle edge case URLs correctly', () => {
    const inputs = [
      '//example.com',
      '/example.com',
      'http://example.com',
      'https://example.com',
      'mailto:test@example.com',
      'tel:+1234567890',
    ];

    inputs.forEach((input) => {
      vi.mocked(isValidURL).mockReturnValue(true);

      const result = sanitizeInput({ input, isURL: true });
      const sanitizedOutput = DOMPurify.sanitize(input);

      expect(isValidURL).toHaveBeenCalledWith(input, false);
      expect(result).toBe(sanitizedOutput);
    });
  });

  it('should return empty string for disallowed protocols', () => {
    const inputs = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
    ];

    inputs.forEach((input) => {
      vi.mocked(isValidURL).mockReturnValue(false);

      const result = sanitizeInput({ input, isURL: true });

      expect(isValidURL).toHaveBeenCalledWith(input, false);
      expect(result).toBe('');
    });
  });

  it('should return empty string for URLs with invalid characters', () => {
    const inputs = ['http://example.com/\\x00', 'http://example.com/\\x1F'];

    inputs.forEach((input) => {
      vi.mocked(isValidURL).mockReturnValue(false);

      const result = sanitizeInput({ input, isURL: true });

      expect(isValidURL).toHaveBeenCalledWith(input, false);
      expect(result).toBe('');
    });
  });

  it('should sanitize script injections using <img> tag', () => {
    const input = '<img src="javascript:alert(\'XSS\')">';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });

  it('should sanitize input with broken up JavaScript keywords', () => {
    const input = '<scr<script>ipt>alert("XSS")</scr<script>ipt>';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });

  it('should sanitize input with event handlers', () => {
    const input = '<div onmouseover="alert(\'XSS\')">Hover me</div>';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });

  it('should sanitize input with src="javascript:..."', () => {
    const input = '<img src="javascript:alert(\'XSS\')">';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });

  it('should sanitize input with "STYLE=" expression()', () => {
    const input = '<div style="width: expression(alert(\'XSS\'));">Test</div>';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });

  it('should sanitize input with "vbscript:"', () => {
    const input = '<a href="vbscript:msgbox(\'XSS\')">Click me</a>';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });

  it('should sanitize input with nested tags', () => {
    const input = '<<script>script>alert("XSS");//<</script>/script>';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });

  it('should sanitize input with null characters', () => {
    const input = '<img src="xss\x00.jpg">';
    const result = sanitizeInput({ input, isURL: false });
    const sanitizedOutput = DOMPurify.sanitize(input);

    expect(result).toBe(sanitizedOutput);
  });
});
