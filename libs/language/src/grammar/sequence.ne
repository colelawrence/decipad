sequence -> "[" _ sequenceSpec _ "]"                {%
                                                    (d, l) => {
                                                      const seq = d[2]
                                                      return {
                                                        ...seq,
                                                        location: l,
                                                        length: lengthOf(d)
                                                      }
                                                    }
                                                    %}

sequenceSpec -> rangeSpec _ "by" _ expression       {%
                                                    (d, l) => {
                                                      const range = d[0]
                                                      return {
                                                        type: "sequence",
                                                        args: [
                                                          range.args[0],
                                                          range.args[1],
                                                          d[4]
                                                        ]
                                                      }
                                                    }
                                                    %}
