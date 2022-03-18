@lexer tokenizer

column_assign -> identifier _ "." _ identifier _ "=" _ expression
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
                                                        d[8]
                                                      ]
                                                    }, d)
                                                  }%}
