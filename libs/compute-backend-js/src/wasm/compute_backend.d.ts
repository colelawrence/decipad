/* tslint:disable */
/* eslint-disable */
/**
*/
export function greet(): void;
/**
*/
export enum ComputeErrors {
  IncorrectType = 0,
  UnknownId = 1,
}
/**
*/
export class ComputeBackend {
  free(): void;
/**
*/
  constructor();
/**
* @param {string} id
* @param {Float64Array} value
*/
  insert_number_column(id: string, value: Float64Array): void;
/**
* @param {string} id
* @param {bigint} start
* @param {bigint} end
* @returns {Float64Array | undefined}
*/
  get_slice(id: string, start: bigint, end: bigint): Float64Array | undefined;
/**
*
*     * Returns the sum of internal column values,
*     * and returns a regular JSNumber (f64).
*     *
*     * @throws Rust Result are exceptions in JS.
*     
* @param {string} id
* @returns {number}
*/
  sum(id: string): number;
/**
* @param {Float64Array} value
* @returns {number}
*/
  sum_from_js(value: Float64Array): number;
/**
* @param {BigInt64Array} numerators
* @param {BigInt64Array} denominator
* @returns {BigInt64Array}
*/
  sum_from_js_frac(numerators: BigInt64Array, denominator: BigInt64Array): BigInt64Array;
}
