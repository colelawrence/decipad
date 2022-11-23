@preprocessor esmodule

@{%
/* eslint-disable */
import { tokenizer } from '../tokenizer'
%}

# Defines that the variable "tokenizer" above is our lexer here.
# Needs to be used in every .ne file
@lexer tokenizer

@include "./reserved.ne"
@include "./utils.ne"
@include "./white-space.ne"
@include "./assign.ne"
@include "./column_assign.ne"
@include "./categories.ne"
@include "./matrix.ne"
@include "./literal.ne"
@include "./number.ne"
@include "./string.ne"
@include "./date.ne"
@include "./column.ne"
@include "./table.ne"
@include "./tiered.ne"
@include "./match.ne"
@include "./expression.ne"
@include "./range.ne"
@include "./sequence.ne"
@include "./functions.ne"



##################
### Statements ###
##################

block         -> (%statementSep | %ws):? statement (%statementSep statement):* (%statementSep | %ws):? {%
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
statement     -> column_assign                          {% id %}
statement     -> matrixAssign                           {% id %}
statement     -> functionDef                            {% id %}
statement     -> expression                             {% id %}
statement     -> categories                             {% id %}

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

currency     -> %currency                               {%
                                                        ([currency]) => {
                                                          return addLoc({
                                                            type: 'ref',
                                                            args: [ currency.value ]
                                                          }, currency)
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

ref          -> %identifier                             {%
                                                        (d, _l, reject) => {
                                                          const name = d[0].value
                                                          if (reservedWords.has(name)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({ type: 'ref', args: [ name ] }, d[0])
                                                          }
                                                        }
                                                        %}


###############
### Aliases ###
###############

equalSign  -> _ ("=" | "is") _                          {% (d) => d[1] %}


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
