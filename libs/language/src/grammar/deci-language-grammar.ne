@preprocessor esmodule

@{%
import { tokenizer } from './tokenizer'
%}

# Defines that the variable "tokenizer" above is our lexer here.
# Needs to be used in every .ne file
@lexer tokenizer

@include "./white-space.ne"
@include "./literal.ne"
@include "./number.ne"
@include "./unit.ne"
@include "./string.ne"
@include "./date.ne"
@include "./column.ne"
@include "./table.ne"
@include "./select.ne"
@include "./expression.ne"
@include "./time-quantity.ne"
@include "./range.ne"
@include "./sequence.ne"
@include "./import-data.ne"
@include "./functions.ne"

@{%

import { knowsUnit } from '../units'

const reservedWords = new Set([
  'in',
  'as',
  'to',
  'where',
  'given',
  'per',
  'true',
  'false',
  'if',
  'then',
  'else',
  'through',
  'date',
  'function',
  'select',
  'and',
  'not',
  'or',
  'with'
])

const monthStrings = new Set([
  'Jan',
  'January',
  'Feb',
  'February',
  'Mar',
  'March',
  'Apr',
  'April',
  'May',
  'Jun',
  'June',
  'Jul',
  'July',
  'Aug',
  'August',
  'Sep',
  'September',
  'Oct',
  'October',
  'Nov',
  'November',
  'Dec',
  'December'
])

const timeUnitStrings = new Set([
  'year',
  'years',
  'quarter',
  'quarters',
  'month',
  'months',
  'weeks',
  'week',
  'day',
  'days',
  'hour',
  'hours',
  'minute',
  'minutes',
  'second',
  'seconds',
  'millisecond',
  'milliseconds',
])

function isReservedWord(str) {
  return reservedWords.has(str)
}

const _getStart = (tokOrNode) =>
  tokOrNode.offset != null
    ? tokOrNode.offset
    : tokOrNode.start

const _getEnd = (tokOrNode) =>
  tokOrNode.offset != null
    ? tokOrNode.offset + tokOrNode.text.length - 1
    : tokOrNode.end

const noEndToken = Symbol('no end token was passed')
function addLoc(node, start, end = start) {
  node.start = _getStart(start)
  node.end = _getEnd(end)

  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    throw new Error('Bad start or end at ' + JSON.stringify(node, null, 2) + '\n\n-- given: ' + JSON.stringify({ start, end }, null, 2) + '')
  } else {
    return node
  }
}

function getLocationFromArray(locArray) {
  // Most of the time it's really easy to find
  const shortCircuitStart = locArray[0] && _getStart(locArray[0])
  const shortCircuitEnd = locArray[locArray.length - 1] && _getEnd(locArray[locArray.length - 1])
  if (shortCircuitEnd != null && shortCircuitStart != null) {
    return [shortCircuitStart, shortCircuitEnd]
  }

  let start = null
  let end = null

  const foundToken = (tokOrNode) => {
    if (tokOrNode != null) {
      const newStart = _getStart(tokOrNode)
      const newEnd = _getEnd(tokOrNode)

      if (newStart != null && newEnd != null) {
        if (start == null) {
          start = newStart
        }
        end = newEnd
      }
    }
  }

  ;(function recurse(array) {
    if (array == null) return

    if (Array.isArray(array)) {
      for (const item of array) {
        recurse(item)
      }
    } else {
      foundToken(array)
    }
  })(locArray)

  return [start, end]
}

function addArrayLoc(node, locArray) {
  const [start, end] = getLocationFromArray(locArray)
  node.start = start
  node.end = end
  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    throw new Error('Bad start or end at ' + JSON.stringify(node, null, 2) + '\n\n-- given: ' + JSON.stringify({ start, end }, null, 2) + '')
  } else {
    return node
  }
}

%}

##################
### Statements ###
##################

block         -> _ statement (__n statement):* _        {%
                                                        (d) => {
                                                          const stmt = d[1]
                                                          const repetitions = d[2]
                                                            .map(([__n, stmt]) => stmt)

                                                          return addArrayLoc({
                                                            type: 'block',
                                                            args: [stmt, ...repetitions],
                                                          }, d)
                                                        }
                                                        %}

statement     -> assign                                 {% id %}
statement     -> functionDef                            {% id %}
statement     -> expression                             {% id %}

assign -> identifier _ "=" _ assignable                 {%
                                                        (d) => addArrayLoc({
                                                          type: 'assign',
                                                          args: [
                                                            addLoc({
                                                              type: 'def',
                                                              args: [d[0].name]
                                                            }, d[0]),
                                                            d[4]
                                                          ]
                                                        }, d)
                                                        %}

assignable -> expression                                {% id %}
assignable -> table                                     {% id %}

##################
### References ###
##################

identifier -> %identifier                               {%
                                                        (d, _l, reject) => {
                                                          const identString = d[0].value

                                                          if (isReservedWord(identString)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({ name: identString }, d[0])
                                                          }
                                                        }
                                                        %}

genericIdentifier -> %identifier                        {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'generic-identifier',
                                                            args: [d[0].value]
                                                          }, d)
                                                        }
                                                        %}

###################
### Conditional ###
###################

expression -> "if" __ expression __ "then" __ expression __ "else" __ expression {%
                                                        (d) => addArrayLoc({
                                                          type: 'function-call',
                                                          args: [
                                                            addLoc({
                                                              type: 'funcref',
                                                              args: ['if'],
                                                            }, d[0]),
                                                            addArrayLoc({
                                                              type: 'argument-list',
                                                              args: [
                                                                d[2],
                                                                d[6],
                                                                d[10]
                                                              ],
                                                            }, d.slice(2))
                                                          ],
                                                        }, d)
                                                        %}
