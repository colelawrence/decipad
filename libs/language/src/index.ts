/* istanbul ignore file: just config and re-export */
import { enableMapSet } from 'immer';
import 'reflect-metadata';
import 'regenerator-runtime/runtime.js';
export * from './runtime';
export { parse } from './parser';
export { inferTargetStatement } from './infer'
export { run } from './interpreter'

enableMapSet();

// Global stuff:
// Result (returned from resultAt) { type: Type (global), value: number[] }
// AST.*
// Type

/*
Functions exported
createRuntime
*/
