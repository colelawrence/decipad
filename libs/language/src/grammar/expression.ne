##################
### Expression ###
##################

expression   -> term                                    {% id %}

expression   -> term _ dissociativeOperator _ expression {%
                                                        (d, l, reject) => {
                                                          const term = d[0]
                                                          const op = d[2]
                                                          const expr = d[4]
                                                          const totalLength = lengthOf(d)

                                                          // reject if this looks like a date in the format yyyy-mm or yyyy-mm-dd
                                                          if (
                                                              (op.name === '-') &&
                                                              (
                                                                (term.type === 'literal') &&
                                                                (term.args[0] === 'number') &&
                                                                (term.length === 4) &&
                                                                (
                                                                  (
                                                                    (
                                                                      (
                                                                        (totalLength === 7) &&
                                                                        (expr.type === 'literal') &&
                                                                        (expr.args[0] === 'number') &&
                                                                        (expr.length === 2) &&
                                                                        (expr.args[1] <= 12 && expr.args[1] >= 1)
                                                                      ) ||
                                                                      (
                                                                        (totalLength === 10) &&
                                                                        (expr.type === 'function-call') &&
                                                                        (expr.args[0].type === 'funcref') &&
                                                                        (expr.args[0].args[0] === '-') &&
                                                                        (expr.args[1].args.length === 2) &&
                                                                        (
                                                                          (
                                                                            (expr.args[1].args[0].type === 'literal') &&
                                                                            (expr.args[1].args[0].args[0] === 'number') &&
                                                                            (expr.args[1].args[0].length === 2) &&
                                                                            (
                                                                              (
                                                                                (expr.args[1].args[1].type === 'literal') &&
                                                                                (expr.args[1].args[1].args[0] === 'number') &&
                                                                                (expr.args[1].args[1].length === 2)
                                                                              ) ||
                                                                              (
                                                                                (expr.args[1].args[1].type === 'ref') &&
                                                                                (monthStrings.has(expr.args[1].args[1].args[0]))
                                                                              )
                                                                            )
                                                                          ) ||
                                                                          (
                                                                            (expr.args[1].args[0].type === 'ref') &&
                                                                            (monthStrings.has(expr.args[1].args[0].args[0])) &&
                                                                            (expr.args[1].args[1].type === 'literal') &&
                                                                            (expr.args[1].args[1].args[0] === 'number') &&
                                                                            (expr.args[1].args[1].length === 2)

                                                                          )
                                                                        )
                                                                      ) ||
                                                                      (
                                                                        (expr.type === 'ref') &&
                                                                        (monthStrings.has(expr.args[0]))
                                                                      )
                                                                    )
                                                                  ) ||
                                                                  (
                                                                    (expr.type === 'function-call') &&
                                                                    (expr.args[0].args[0] === '-') &&
                                                                    (expr.args[1].args.length === 2) &&
                                                                    (expr.args[1].args[0].type === 'ref') &&
                                                                    (monthStrings.has(expr.args[1].args[0].args[0])) &&
                                                                    (expr.args[1].args[1].type === 'literal') &&
                                                                    (expr.args[1].args[1].args[0] === 'number') &&
                                                                    (expr.args[1].args[1].length === 2)
                                                                  )
                                                                )
                                                              ) ||
                                                              (
                                                                (term.type === 'date') &&
                                                                (expr.type === 'literal') &&
                                                                (expr.args[0] === 'number') &&
                                                                (expr.length === 2)
                                                              )
                                                            )
                                                          {
                                                            return reject
                                                          }

                                                          if (
                                                            (op.name === '+') &&
                                                            (term.type === 'date') &&
                                                            (expr.type === 'literal') &&
                                                            (expr.args[0] === 'number')
                                                          ) {
                                                            return reject
                                                          }

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [op.name],
                                                                location: l + lengthOf([term, d[1]]),
                                                                length: op.length
                                                              },
                                                              {
                                                                type: 'argument-list',
                                                                args: [term, expr],
                                                                location: l,
                                                                length: totalLength
                                                              }
                                                            ],
                                                            location: l,
                                                            length: totalLength
                                                          }
                                                        }
                                                        %}

term         -> factor                                  {% id %}
term         -> factor _ associativeOperator _ term     {%
                                                        (d, l) => {
                                                          const factor = d[0]
                                                          const op = d[2]
                                                          const term = d[4]
                                                          const totalLength = lengthOf(d)

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [op.name],
                                                                location: l + lengthOf([factor, d[1]]),
                                                                length: op.length
                                                              },
                                                              {
                                                                type: 'argument-list',
                                                                args: [factor, term],
                                                                location: l,
                                                                length: totalLength
                                                              }
                                                            ],
                                                            location: l,
                                                            length: totalLength
                                                          }
                                                        }
                                                        %}

factor       -> literal                                 {% id %}
factor       -> referenceInExpression                   {%
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

factor       -> "(" _ expression _ ")"                  {%
                                                        (d, l) => {
                                                          return {
                                                            ...d[2],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

factor       -> "-" _ expression                        {%
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

expression   -> given                                   {% id %}
expression   -> conditional                             {% id %}
expression   -> functionCall                            {% id %}
factor       -> term _ "." _ propertyAccessor           {%
                                                        (d, l) => ({
                                                          type: 'property-access',
                                                          args: [
                                                            d[0],
                                                            d[4].name
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

propertyAccessor -> referenceInExpression               {% id %}
