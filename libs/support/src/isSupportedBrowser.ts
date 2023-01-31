import Bowser from 'bowser';

export const isSupportedBrowser = () => {
  const browser = Bowser.getParser(window.navigator.userAgent);

  return browser.satisfies({
    chrome: '>=100',
  });
};
