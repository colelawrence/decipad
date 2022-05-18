const { warn, error } = console;

const suppressMessagesBeginnings = [
  'Warning: A component is `contentEditable` and contains `children`',
  'Warning: validateDOMNesting',
  'Warning: Function components cannot be given refs',
];

const suppress = (s: string): boolean => {
  return suppressMessagesBeginnings.some(
    (beginning) => s.startsWith && s.startsWith(beginning)
  );
};

const p =
  (printFn: typeof warn | typeof error) =>
  (message: string, ...rest: unknown[]) => {
    if (!suppress(message)) printFn.call(console, message, ...rest);
  };

if (process.env.NEXT_PUBLIC_DECI_SUPPRESS_WARNINGS) {
  console.warn = p(warn);
  console.error = p(error);
}

export { p };
