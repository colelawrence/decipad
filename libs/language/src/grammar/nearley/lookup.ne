## lookup with "[expression]"
lookup        -> ref _ "[" _ expression _ "]" {%
                                                      (d) => addArrayLoc({
                                                          type: 'function-call',
                                                          args: [
                                                            addLoc({
                                                              type: 'funcref',
                                                              args: ['lookup'],
                                                            }, d[0]),
                                                            addLoc({
                                                              type: 'argument-list',
                                                              args: [d[0], d[4]],
                                                            }, d[2])
                                                          ]
                                                        }, d)
                                                      %}
