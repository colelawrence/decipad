type RoundEqInput =
  | number
  | number[]
  | number[][]
  | number[][][]
  | number[][][][];

declare namespace jest {
  interface Matchers<R> {
    toRoundEqual: (n: RoundEqInput) => R;
  }

  interface Expect {
    toRoundEqual: (n: RoundEqInput) => any;
  }
}
