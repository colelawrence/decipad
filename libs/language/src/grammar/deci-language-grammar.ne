@preprocessor esmodule

@{%
import { tokenizer } from './tokenizer'
%}

# Defines that the variable "tokenizer" above is our lexer here.
# Needs to be used in every .ne file
@lexer tokenizer

@include "./reserved.ne"
@include "./utils.ne"
@include "./white-space.ne"
@include "./literal.ne"
@include "./number.ne"
@include "./string.ne"
@include "./date.ne"
@include "./column.ne"
@include "./table.ne"
@include "./select.ne"
@include "./expression.ne"
@include "./range.ne"
@include "./sequence.ne"
@include "./import-data.ne"
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

ref          -> identifier                              {%
                                                        (d, _l, reject) => {
                                                          const name = d[0].name
                                                          if (reservedWords.has(name)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({ type: 'ref', args: [ name ] }, d[0])
                                                          }
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
