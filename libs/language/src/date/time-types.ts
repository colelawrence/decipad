/**
 * A unit of time available for time quantities in the language (eventually dates too)
 */
export type Unit =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

/**
 * The arguments to JavaScript's new Date() or Date.UTC
 */
export type JSDateUnit =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

/**
 * Specificity of a date in the language. quarter, week get turned into months, days. hours, minutes etc get turned into "time" because to the language all the time of day is the same type.
 */
export type Specificity = 'year' | 'month' | 'day' | 'time';
