##################
### Expression ###
##################

expression    -> nonGivenExp                            {% id %}
expression    -> given                                  {% id %}

nonGivenExp   -> divMulOp                               {% id %}
nonGivenExp   -> table                                  {% id %}
nonGivenExp   -> importData                             {% id %}

divMulOp      -> addSubOp                               {% id %}
divMulOp      -> divMulOp _ additiveOperator _ addSubOp {%
                                                        (d, l, reject) => {
                                                          const left = d[0]
                                                          const op = d[2]
                                                          const right = d[4]
                                                          const totalLength = lengthOf(d)

                                                          if (
                                                            (op.name === '+') &&
                                                            (left.type === 'date') &&
                                                            (right.type === 'literal') &&
                                                            (right.args[0] === 'number')
                                                          ) {
                                                            return reject
                                                          }

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [op.name],
                                                                location: l + lengthOf([left, d[1]]),
                                                                length: op.length
                                                              },
                                                              {
                                                                type: 'argument-list',
                                                                args: [left, right],
                                                                location: l,
                                                                length: totalLength
                                                              }
                                                            ],
                                                            location: l,
                                                            length: totalLength
                                                          }
                                                        }
                                                        %}

addSubOp     -> primary                                 {% id %}
addSubOp     -> addSubOp _ multiplicativeOperator _ primary {%
                                                        (d, l) => {
                                                          const left = d[0]
                                                          const op = d[2]
                                                          const right = d[4]
                                                          const totalLength = lengthOf(d)

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [op.name],
                                                                location: l + lengthOf([left, d[1]]),
                                                                length: op.length
                                                              },
                                                              {
                                                                type: 'argument-list',
                                                                args: [left, right],
                                                                location: l,
                                                                length: totalLength
                                                              }
                                                            ],
                                                            location: l,
                                                            length: totalLength
                                                          }
                                                        }
                                                        %}

basicRef     -> identifier                              {%
                                                        (d, l, reject) => {
                                                          const name = d[0]
                                                          if (reservedWords.has(name.name)) {
                                                            return reject
                                                          }
                                                          return {
                                                            type: 'ref',
                                                            args: [ name.name ],
                                                            location: l,
                                                            length: name.length
                                                          }
                                                        }
                                                        %}

primary      -> functionCall                            {% id %}

primary      -> literal                                 {% id %}
primary      -> basicRef                                {% id %}

primary      -> "(" _ expression _ ")"                  {%
                                                        (d, l) => {
                                                          return {
                                                            ...d[2],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

primary      -> "-" _ expression                        {%
                                                        (d, l, reject) => {
                                                          const expr = d[2]
                                                          if (
                                                            expr.type === 'literal' &&
                                                            expr.args[0] === 'number'
                                                          ) {
                                                            expr.args[1] = -expr.args[1]
                                                            return {
                                                              type: expr.type,
                                                              args: expr.args,
                                                              location: l,
                                                              length: lengthOf(d)
                                                            }
                                                          } else {
                                                            return {
                                                              type: 'function-call',
                                                              args: [
                                                                {
                                                                  type: 'funcref',
                                                                  args: ['unary-'],
                                                                  location: l,
                                                                  length: 1
                                                                },
                                                                {
                                                                  type: 'argument-list',
                                                                  args: [d[2]],
                                                                  location: lengthOf([d[0], d[1]]),
                                                                  length: d[2].length
                                                                }
                                                              ],
                                                              location: l,
                                                              length: lengthOf(d)
                                                            }
                                                          }
                                                        }
                                                        %}

primary      -> basicRef _ "." _ basicRef               {%
                                                        (d, l) => ({
                                                          type: 'property-access',
                                                          args: [
                                                            d[0],
                                                            d[4].args[0]
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}


#################
### Operators ###
#################

additiveOperator  -> ("-" | "+" | "&&" | "||")          {%
                                                        (d, l) => {
                                                          const op = d[0][0]
                                                          return {
                                                            name: op,
                                                            location: l,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}

additiveOperator  -> __ ("in") __                       {%
                                                        (d, l) => {
                                                          return {
                                                            name: d[1],
                                                            location: l + d[0].length,
                                                            length: d[1].length
                                                          }
                                                        }
                                                        %}


multiplicativeOperator -> ("**" | ">" | "<" | "<=" | ">=" | "==") {%
                                                        (d, l) => {
                                                          const op = d[0][0]
                                                          return {
                                                            name: op,
                                                            location: l,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}
multiplicativeOperator -> (" * " | " / " | " % " | " ^ ") {%
                                                        (d, l) => {
                                                          const op = d[0][0]
                                                          return {
                                                            name: op.trim(),
                                                            location: l + 1,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}
