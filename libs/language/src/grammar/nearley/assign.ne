
@lexer tokenizer

assign            -> assignTarget equalSign expression  {%
                                                        (d) => addArrayLoc({
                                                          type: 'assign',
                                                          args: [d[0], d[2]]
                                                        }, d)
                                                        %}

assignTarget      -> identifier                         {%
                                                        (d) => {
                                                          return addLoc({
                                                            type: 'def',
                                                            args: [d[0].name]
                                                          }, d[0])
                                                        }
                                                        %}
