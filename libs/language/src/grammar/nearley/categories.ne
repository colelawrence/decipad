@lexer tokenizer

categories -> identifier equalSign "categories" _ expression{%
                                                            (d) => {
                                                              return addArrayLoc({
                                                                type: 'categories',
                                                                args: [
                                                                  addLoc({
                                                                    type: 'catdef',
                                                                    args: [d[0].name]
                                                                  }, d[0]),
                                                                  d[4]
                                                                ]
                                                              }, d);
                                                            }
                                                            %}
