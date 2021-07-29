@include "./white-space.ne"
@include "./literal.ne"
@include "./number.ne"
@include "./unit.ne"
@include "./string.ne"
@include "./date.ne"
@include "./column.ne"
@include "./given.ne"
@include "./table.ne"
@include "./expression.ne"
@include "./time-quantity.ne"
@include "./range.ne"
@include "./sequence.ne"
@include "./import-data.ne"
@include "./functions.ne"
@{%

const knownUnits = require('./units').knownUnits

const reservedWords = new Set([
  'in',
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
  'month',
  'months',
  'quarter',
  'quarters',
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

function lengthOf(d) {
  if (Array.isArray(d)) {
    return d.reduce((acc, item) => acc + lengthOf(item), 0)
  } else {
    return d?.length ?? 0
  }
}

%}


##################
### Statements ###
##################

block         -> _ statement (__n statement):* _        {%
                                                        (d, l) => {
                                                          const stmt = d[1]
                                                          const repetitions = d[2]
                                                            .map(([__n, stmt]) => stmt)

                                                          return {
                                                            type: 'block',
                                                            args: [stmt, ...repetitions],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

statement     -> assign                                 {%
                                                        (d, l) => {
                                                          const stmt = d[0]
                                                          return {
                                                            ...stmt,
                                                            location: l,
                                                            length: stmt.length
                                                          }
                                                        }
                                                        %}
statement     -> functionDef                            {%
                                                        (d, l) => {
                                                          const stmt = d[0]
                                                          return {
                                                            ...stmt,
                                                            location: l,
                                                            length: stmt.length
                                                          }
                                                        }
                                                        %}
statement     -> expression                             {%
                                                        (d, l) => {
                                                          const stmt = d[0]
                                                          return {
                                                            ...stmt,
                                                            location: l,
                                                            length: stmt.length
                                                          }
                                                        }
                                                        %}

assign -> identifier _ "=" _ expression                 {%
                                                        (d, l) => ({
                                                          type: 'assign',
                                                          args: [
                                                            {
                                                              type: 'def',
                                                              args: [d[0].name],
                                                              location: l,
                                                              length: d[0].length
                                                            },
                                                            d[4]
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}


##################
### References ###
##################

identifier -> ([a-zA-Z\$] [a-zA-Z0-9_\$]:*)             {%
                                                        (d, l, reject) => {
                                                          const identString = d[0][0] + d[0][1].join('')

                                                          if (isReservedWord(identString)) {
                                                            return reject
                                                          } else {
                                                            return {
                                                              name: identString,
                                                              location: l,
                                                              length: identString.length
                                                            }
                                                          }
                                                        }
                                                        %}


###################
### Conditional ###
###################

expression -> "if" __ expression __ "then" __ expression __ "else" __ expression {%
                                                        (d, l) => ({
                                                          type: 'function-call',
                                                          args: [
                                                            {
                                                              type: 'funcref',
                                                              args: ['if'],
                                                              location: l,
                                                              length: 2
                                                            },
                                                            {
                                                              type: 'argument-list',
                                                              args: [
                                                                d[2],
                                                                d[6],
                                                                d[10]
                                                              ],
                                                              location: d[2].location,
                                                              length: lengthOf(d.slice(2))
                                                            }
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
