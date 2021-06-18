##################
### Expression ###
##################

expression    -> nonGivenExp                             {% id %}
expression    -> given                                   {% id %}

nonGivenExp   -> divMulOp                                {% id %}
nonGivenExp   -> table                                   {% id %}
nonGivenExp   -> functionCall                            {% id %}
nonGivenExp   -> importData                              {% id %}

divMulOp      -> addSubOp                                {% id %}
divMulOp      -> divMulOp _ dissociativeOperator _ addSubOp {%
                                                        (d, l, reject) => {
                                                          const left = d[0]
                                                          const op = d[2]
                                                          const right = d[4]
                                                          const totalLength = lengthOf(d)

                                                          // reject if this looks like a date in the format yyyy-mm or yyyy-mm-dd
                                                          if (
                                                              (op.name === '-') &&
                                                              (
                                                                (left.type === 'literal') &&
                                                                (left.args[0] === 'number') &&
                                                                (left.length === 4) &&
                                                                (
                                                                  (
                                                                    (
                                                                      (
                                                                        (totalLength === 7) &&
                                                                        (right.type === 'literal') &&
                                                                        (right.args[0] === 'number') &&
                                                                        (right.length === 2) &&
                                                                        (right.args[1] <= 12 && right.args[1] >= 1)
                                                                      ) ||
                                                                      (
                                                                        (totalLength === 10) &&
                                                                        (right.type === 'function-call') &&
                                                                        (right.args[0].type === 'funcref') &&
                                                                        (right.args[0].args[0] === '-') &&
                                                                        (right.args[1].args.length === 2) &&
                                                                        (
                                                                          (
                                                                            (right.args[1].args[0].type === 'literal') &&
                                                                            (right.args[1].args[0].args[0] === 'number') &&
                                                                            (right.args[1].args[0].length === 2) &&
                                                                            (
                                                                              (
                                                                                (right.args[1].args[1].type === 'literal') &&
                                                                                (right.args[1].args[1].args[0] === 'number') &&
                                                                                (right.args[1].args[1].length === 2)
                                                                              ) ||
                                                                              (
                                                                                (right.args[1].args[1].type === 'ref') &&
                                                                                (monthStrings.has(right.args[1].args[1].args[0]))
                                                                              )
                                                                            )
                                                                          ) ||
                                                                          (
                                                                            (right.args[1].args[0].type === 'ref') &&
                                                                            (monthStrings.has(right.args[1].args[0].args[0])) &&
                                                                            (right.args[1].args[1].type === 'literal') &&
                                                                            (right.args[1].args[1].args[0] === 'number') &&
                                                                            (right.args[1].args[1].length === 2)

                                                                          )
                                                                        )
                                                                      ) ||
                                                                      (
                                                                        (right.type === 'ref') &&
                                                                        (monthStrings.has(right.args[0]))
                                                                      )
                                                                    )
                                                                  ) ||
                                                                  (
                                                                    (right.type === 'function-call') &&
                                                                    (right.args[0].args[0] === '-') &&
                                                                    (right.args[1].args.length === 2) &&
                                                                    (right.args[1].args[0].type === 'ref') &&
                                                                    (monthStrings.has(right.args[1].args[0].args[0])) &&
                                                                    (right.args[1].args[1].type === 'literal') &&
                                                                    (right.args[1].args[1].args[0] === 'number') &&
                                                                    (right.args[1].args[1].length === 2)
                                                                  )
                                                                )
                                                              ) ||
                                                              (
                                                                (left.type === 'date') &&
                                                                (right.type === 'literal') &&
                                                                (right.args[0] === 'number') &&
                                                                (right.length === 2)
                                                              )
                                                            )
                                                          {
                                                            return reject
                                                          }

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
addSubOp     -> addSubOp _ associativeOperator _ primary {%
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

basicRef     -> referenceInExpression                   {%
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
                                                          if (expr.type === 'literal' && expr.args[0] === 'number') {
                                                            return reject
                                                          }

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [d[0]],
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
