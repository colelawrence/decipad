const { warn, error } = console;

const suppressMessagesBeginnings = [
  'Warning: validateDOMNesting',
  'Warning: Function components cannot be given refs',
  'Warning: A component is `contentEditable` and contains `children` managed by React',
  'Warning: React does not recognize the',
  'Warning: Unknown event handler property',
  'Warning: Using UNSAFE_componentWillMount in strict mode is not recommended',
];

const suppress = (s: string): boolean => {
  return suppressMessagesBeginnings.some(
    (beginning) => s.startsWith && s.startsWith(beginning)
  );
};

const wrapConsoleMethodWithSuppress =
  (printFn: typeof warn | typeof error) =>
  (message: string, ...rest: unknown[]) => {
    if (!suppress(message)) printFn.call(console, message, ...rest);
  };

export default function suppressWarnings() {
  console.warn = wrapConsoleMethodWithSuppress(warn);
  console.error = wrapConsoleMethodWithSuppress(error);
}
