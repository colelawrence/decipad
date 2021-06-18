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
@{%

const knownUnits = require('./units').knownUnits

const reservedWords = new Set([
  '\n',
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
  '+',
  '-',
  '*',
  '/',
  '^',
  '**'
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

function containsReservedWord(words) {
  return words.some(w => isReservedWord(w))
}

function lengthOf(d) {
  if (!d) {
    return 0
  }
  return d.reduce((acc, c) => acc + ((c && c.length) || 0), 0)
}

%}

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

statement     -> refAssignment                          {%
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

##################
### References ###
##################

refAssignment -> referenceName _ "=" _ expression       {%
                                                        (d, l) => (
                                                          {
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
                                                          }
                                                        )
                                                        %}

referenceName -> ([a-zA-Z\$] [a-zA-Z0-9]:*) (" " [a-zA-Z0-9]:+):* {%
                                                        (d, l, reject) => {
                                                          const first = d[0][0] + d[0][1].join('')
                                                          const rest = d[1].map((e) => e[0] + e[1].join('')).join('')
                                                          const r =  first + rest

                                                          if (containsReservedWord(r.split(' '))) {
                                                            return reject
                                                          } else {
                                                            return {
                                                              name: r,
                                                              location: l,
                                                              length: r.length
                                                            }
                                                          }
                                                        }
                                                        %}

referenceInExpression -> [a-zA-Z\$] [a-zA-Z0-9]:*       {%
                                                        (d, l, reject) => {
                                                          const r = d[0] + d[1].join('')

                                                          if (containsReservedWord(r.split(' '))) {
                                                            return reject
                                                          } else {
                                                            return {
                                                              name: r,
                                                              location: l,
                                                              length: r.length
                                                            }
                                                          }
                                                        }
                                                        %}

referenceInExpression -> "`" referenceName "`"          {%
                                                        (d, l) => {
                                                          return {
                                                            name: d[1].name,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}


###########################
### Function definition ###
###########################

functionDef -> functionDefName _ "=" _ functionDefArgs _ "=>" _ statement {%
                                                        (d, l) => ({
                                                          type: "function-definition",
                                                          args: [
                                                            {
                                                              type: "funcdef",
                                                              args: [d[0]],
                                                              location: l,
                                                              length: d[0].length
                                                            },
                                                            d[4],
                                                            {
                                                              type: 'block',
                                                              args: [d[8]],
                                                              location: d[8].location,
                                                              length: d[8].length
                                                            }
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

functionDefName -> simpleFunctionDefName                {% id %}
functionDefName -> complexFunctionDefName               {% id %}

simpleFunctionDefName -> [a-z] [0-9a-zA-Z]:*            {%
                                                        (d, l, reject) => {
                                                          const name = d[0] + d[1].join('')

                                                          if (isReservedWord(name)) {
                                                            return reject
                                                          } else {
                                                            return name
                                                          }
                                                        }
                                                        %}

complexFunctionDefSurname -> " " [0-9a-zA-Z]:+          {% d => d[0] + d[1].join('') %}
complexFunctionDefName -> simpleFunctionDefName complexFunctionDefSurname:+ {% d => d.join('') %}

functionDefArgs  -> argName                             {%
                                                        (d, l) => ({
                                                          type: 'argument-names',
                                                          args: [d[0]],
                                                          location: l,
                                                          length: d[0].length
                                                        })
                                                        %}

functionDefArgs  -> argName ___ functionDefArgs         {%
                                                        (d, l) => ({
                                                          type: 'argument-names',
                                                          args: [
                                                            d[0]
                                                          ].concat(d[2].args),
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

argName -> [a-zA-Z] [0-9a-zA-Z]:*                       {%
                                                        (d, l) => ({
                                                          type: 'def',
                                                          args: [d[0] + d[1].join('')],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}




################
### Operator ###
################

dissociativeOperator  -> ("+" | "&&" | "||") {%
                                                        (d, l) => {
                                                          const op = d[0][0]
                                                          return {
                                                            name: op,
                                                            location: l,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}

dissociativeOperator  -> __ ("in") __    {%
                                                        (d, l) => {
                                                          return {
                                                            name: d[1],
                                                            location: l + d[0].length,
                                                            length: d[1].length
                                                          }
                                                        }
                                                        %}

dissociativeOperator  -> " - "                          {%
                                                        (d, l) => {
                                                          const op = d[0]
                                                          return {
                                                            name: op.trim(),
                                                            location: l + 1,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}


associativeOperator -> ("**" | ">" | "<" | "<=" | ">=" | "==")       {%
                                                        (d, l) => {
                                                          const op = d[0][0]
                                                          return {
                                                            name: op,
                                                            location: l,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}
associativeOperator -> (" * " | " / " | " % " | " ^ ")  {%
                                                        (d, l) => {
                                                          const op = d[0][0]
                                                          return {
                                                            name: op.trim(),
                                                            location: l + 1,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}


#####################
### Function call ###
#####################

functionCall -> functionNameRef ___ funcArgumentList    {%
                                                        (d, l) => {
                                                          const func = d[0]
                                                          const args = d[2]

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [func.name],
                                                                location: func.location,
                                                                length: func.length
                                                              },
                                                              {
                                                                type: 'argument-list',
                                                                args: args.args,
                                                                location: args.location,
                                                                length: args.length
                                                              }
                                                            ],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

functionNameRef -> simpleFunctionNameRef                {% id %}
functionNameRef -> "`" complexFunctionNameRef "`"       {% d => d[1] %}
functionNameRefWord -> [a-zAZ] [0-9a-zA-Z]:*            {%
                                                        (d, l, reject) => {
                                                          const candidate = d[0] + d[1].join('')

                                                          if (isReservedWord(candidate)) {
                                                            return reject
                                                          } else {
                                                            return {
                                                              name: candidate,
                                                              location: l,
                                                              length: lengthOf(d)
                                                            }
                                                          }
                                                        }
                                                        %}
simpleFunctionNameRef -> functionNameRefWord            {% id %}
complexFunctionNameRef -> functionNameRefWord " " complexFunctionNameRef {%
                                                        (d, l) => {
                                                          const part1 = d[0]
                                                          const part2 = d[2]
                                                          return {
                                                            name: part1.name + " " + part2.name,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

funcArgumentList -> expression                          {%
                                                        (d, l) => {
                                                          const e = d[0]
                                                          return {
                                                            args: [e],
                                                            location: l,
                                                            length: e.length
                                                          }
                                                        }
                                                        %}

funcArgumentList -> expression ___ funcArgumentList      {%
                                                        (d, l) => {
                                                          const e = d[0]
                                                          const args = d[2]
                                                          return {
                                                            args: [e, ...args.args],
                                                            location: l,
                                                            length: lengthOf(d)
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
