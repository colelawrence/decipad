@lexer tokenizer

categories -> identifier _ "=" _ "categories" _ expression  {%
                                                            (d) => {
                                                              return addArrayLoc({
                                                                type: 'categories',
                                                                args: [
                                                                  addLoc({
                                                                    type: 'catdef',
                                                                    args: [d[0].name]
                                                                  }, d[0]),
                                                                  d[6]
                                                                ]
                                                              }, d);
                                                            }
                                                            %}
