const suppressMessagesBeginnings = [
  // This is inevitable because using Slate causes this inherently
  'Warning: A component is `contentEditable` and contains `children` managed by React',
  // JSDOM can't handle our css-in-js
  'Error: Could not parse CSS stylesheet',
];

const suppress = (s) =>
  suppressMessagesBeginnings.some(
    (beginning) => s.startsWith && s.startsWith(beginning)
  );

const { warn, error } = console;
const wrapConsoleMethodWithSuppress =
  (printFn) =>
  (message, ...rest) => {
    if (!suppress(message)) printFn.call(console, message, ...rest);
  };

console.warn = wrapConsoleMethodWithSuppress(warn);
console.error = wrapConsoleMethodWithSuppress(error);
