#############
### Given ###
#############

given -> "given" __ identifier _ ":" _ expression {%
                                                  (d, l) => {
                                                    return {
                                                      type: 'given',
                                                      args: [
                                                        {
                                                          type: 'ref',
                                                          args: [d[2].name],
                                                          location: d[2].location,
                                                          length: d[2].length
                                                        },
                                                        d[6]
                                                      ],
                                                      location: l,
                                                      length: lengthOf(d)
                                                    }
                                                  }
                                                  %}
