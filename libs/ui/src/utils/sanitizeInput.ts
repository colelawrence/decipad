import DOMPurify from 'dompurify';
import { isValidURL } from './isValidUrl';

export const sanitizeInput = ({
  input,
  isURL = false,
  allowRelativeURLs = false,
}: {
  input: string;
  isURL: boolean;
  allowRelativeURLs?: boolean;
}) => {
  if (isURL) {
    if (isValidURL(input, allowRelativeURLs)) {
      return DOMPurify.sanitize(input);
    }
    return '';
  }
  return DOMPurify.sanitize(input);
};
