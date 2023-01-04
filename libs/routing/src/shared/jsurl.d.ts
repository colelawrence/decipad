/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'jsurl' {
  export function stringify(obj: any): string;
  export function parse(str: string): any;
}
