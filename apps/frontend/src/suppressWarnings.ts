const { warn, error } = console;

const suppressMessagesBeginnings = ['Warning: validateDOMNesting'];

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
