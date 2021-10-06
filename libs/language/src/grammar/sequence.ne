@lexer tokenizer

sequence -> "[" _ sequenceInner _ "]"               {%
                                                    (d) => addArrayLoc(d[2], d)
                                                    %}

sequenceInner -> rangeSpec _ "by" _ expression      {%
                                                    (d) => {
                                                      const range = d[0]
                                                      return {
                                                        type: "sequence",
                                                        args: [
                                                          range.args[0],
                                                          range.args[1],
                                                          d[4]
                                                        ],
                                                      }
                                                    }
                                                    %}
