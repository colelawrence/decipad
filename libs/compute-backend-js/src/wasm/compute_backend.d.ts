/* tslint:disable */
/* eslint-disable */
/**
*/
export function console_hook(): void;
/**
*/
export function greet(): void;
/**
* @param {string} csv
* @param {boolean} is_first_header_row
* @returns {object}
*/
export function parse_csv(csv: string, is_first_header_row: boolean): object;
/**
* Handler for `console.log` invocations.
*
* If a test is currently running it takes the `args` array and stringifies
* it and appends it to the current output of the test. Otherwise it passes
* the arguments to the original `console.log` function, psased as
* `original`.
* @param {Array<any>} args
*/
export function __wbgtest_console_log(args: Array<any>): void;
/**
* Handler for `console.debug` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_debug(args: Array<any>): void;
/**
* Handler for `console.info` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_info(args: Array<any>): void;
/**
* Handler for `console.warn` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_warn(args: Array<any>): void;
/**
* Handler for `console.error` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_error(args: Array<any>): void;
/**
*/
export enum ComputeErrors {
  IncorrectType = 0,
  UnknownId = 1,
  InferError = 2,
}
/**
*/
export enum Kind {
  Number = 0,
  String = 1,
  Boolean = 2,
  Date = 3,
  Error = 4,
}
export type DeciType = { type: "number" } | { type: "string" } | { type: "boolean" } | { type: "column" } | { type: "table" } | { type: "date"; specificity: DateSpecificity } | { type: "error" };

export type DateSpecificity = "none" | "year" | "quarter" | "month" | "day" | "hour" | "minute" | "second" | "millisecond";

export type ResultType = "Boolean" | "Fraction" | "String" | "Column" | "Date" | "Table" | "Range" | "Row" | "TypeError" | "Pending" | "ArbitraryFraction" | "Tree" | "Function" | "Undefined";

export type Importer = { type: "csv"; isFirstHeaderRow: boolean };

/**
*/
export class ColumnRef {
  free(): void;
/**
*/
  column_type: Kind;
/**
*/
  id: string;
/**
*/
  name: string;
}
/**
*/
export class ComputeBackend {
  free(): void;
/**
* @param {string} csv
* @param {boolean} is_first_header_row
* @returns {object}
*/
  read_csv_in(csv: string, is_first_header_row: boolean): object;
/**
* @param {string} id
* @param {BigInt64Array} nums
* @param {BigInt64Array} dens
*/
  insert_number_column_frac(id: string, nums: BigInt64Array, dens: BigInt64Array): void;
/**
*/
  constructor();
/**
*/
  bench_serialize_nothing(): void;
/**
*/
  bench_serialize_boolean(): void;
/**
*/
  bench_serialize_number(): void;
/**
*/
  bench_serialize_string(): void;
/**
*/
  bench_serialize_bool_col(): void;
/**
*/
  bench_serialize_num_col(): void;
/**
*/
  bench_serialize_string_col(): void;
/**
*/
  bench_deserialize_nothing(): void;
/**
*/
  bench_deserialize_bool(): void;
/**
*/
  bench_deserialize_number(): void;
/**
*/
  bench_deserialize_string(): void;
/**
*/
  bench_deserialize_bool_col(): void;
/**
*/
  bench_deserialize_num_col(): void;
/**
*/
  bench_deserialize_string_col(): void;
/**
* @param {string} id
* @param {bigint} start
* @param {bigint} end
* @returns {object | undefined}
*/
  get_slice(id: string, start: bigint, end: bigint): object | undefined;
/**
* @param {string} id
* @param {bigint} start
* @param {bigint} end
* @returns {(string)[] | undefined}
*/
  get_slice_string(id: string, start: bigint, end: bigint): (string)[] | undefined;
/**
*
*     * Returns the sum of internal column values,
*     * and returns a regular JSNumber (f64).
*     *
*     * @throws Rust Result are exceptions in JS.
*     
* @param {string} id
* @returns {object}
*/
  sum(id: string): object;
/**
* @param {string} id
* @returns {object}
*/
  min(id: string): object;
/**
* @param {string} id
* @returns {object}
*/
  max(id: string): object;
/**
* @param {string} id
* @returns {object}
*/
  average(id: string): object;
/**
* @param {string} id
* @returns {object}
*/
  median(id: string): object;
/**
* @param {object} result
* @returns {object}
*/
  sum_result_fraction_column(result: object): object;
/**
* @param {object} result
* @param {object} mask
* @returns {object}
*/
  sumif_result_fraction_column(result: object, mask: object): object;
/**
* @param {object} result
* @returns {object}
*/
  min_result_fraction_column(result: object): object;
/**
* @param {object} result
* @returns {object}
*/
  max_result_fraction_column(result: object): object;
/**
* @param {object} result
* @returns {object}
*/
  mean_result_fraction_column(result: object): object;
/**
* @param {object} result
* @returns {object}
*/
  median_result_fraction_column(result: object): object;
/**
* @param {object} result
* @returns {boolean}
*/
  test_deserialization(result: object): boolean;
/**
* @param {string} id
* @param {bigint} n
* @param {bigint} d
* @returns {object}
*/
  gt_mask(id: string, n: bigint, d: bigint): object;
/**
* @param {string} id
* @param {bigint} n
* @param {bigint} d
* @returns {object}
*/
  ge_mask(id: string, n: bigint, d: bigint): object;
/**
* @param {string} id
* @param {bigint} n
* @param {bigint} d
* @returns {object}
*/
  lt_mask(id: string, n: bigint, d: bigint): object;
/**
* @param {string} id
* @param {bigint} n
* @param {bigint} d
* @returns {object}
*/
  le_mask(id: string, n: bigint, d: bigint): object;
/**
* @param {string} id
* @param {bigint} n
* @param {bigint} d
* @returns {object}
*/
  eq_mask(id: string, n: bigint, d: bigint): object;
/**
* @param {Uint8Array} data
* @param {Importer} options
* @param {(DeciType)[] | undefined} [types]
* @returns {(ColumnRef)[]}
*/
  import_external_data_from_u8_arr(data: Uint8Array, options: Importer, types?: (DeciType)[]): (ColumnRef)[];
/**
* @param {string} id
*/
  release_external_data(id: string): void;
}
/**
*/
export class SerializedResult {
  free(): void;
/**
* @param {BigUint64Array} type_array
* @param {Uint8Array} data
*/
  constructor(type_array: BigUint64Array, data: Uint8Array);
/**
*/
  readonly data: Uint8Array;
/**
*/
  readonly type_array: BigUint64Array;
}
/**
* Runtime test harness support instantiated in JS.
*
* The node.js entry script instantiates a `Context` here which is used to
* drive test execution.
*/
export class WasmBindgenTestContext {
  free(): void;
/**
* Creates a new context ready to run tests.
*
* A `Context` is the main structure through which test execution is
* coordinated, and this will collect output and results for all executed
* tests.
*/
  constructor();
/**
* Inform this context about runtime arguments passed to the test
* harness.
* @param {any[]} args
*/
  args(args: any[]): void;
/**
* Executes a list of tests, returning a promise representing their
* eventual completion.
*
* This is the main entry point for executing tests. All the tests passed
* in are the JS `Function` object that was plucked off the
* `WebAssembly.Instance` exports list.
*
* The promise returned resolves to either `true` if all tests passed or
* `false` if at least one test failed.
* @param {any[]} tests
* @returns {Promise<any>}
*/
  run(tests: any[]): Promise<any>;
}
