@lexer tokenizer

columnAssign -> identifier _ "." _ identifier equalSign expression
                                                  {% (d) => {
                                                    const table = addLoc({
                                                      type: 'tablepartialdef',
                                                      args: [d[0].name]
                                                    }, d[0])
                                                    const column = addLoc({
                                                      type: 'coldef',
                                                      args: [d[4].name]
                                                    }, d[4])

                                                    return addArrayLoc({
                                                      type: 'table-column-assign',
                                                      args: [
                                                        table,
                                                        column,
                                                        d[6]
                                                      ]
                                                    }, d)
                                                  }%}
