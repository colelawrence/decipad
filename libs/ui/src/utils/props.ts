// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

export type TextChild = React.ReactText | boolean | null | undefined;
export type TextChildren = TextChild | ReadonlyArray<TextChild>;
