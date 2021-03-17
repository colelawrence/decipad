range -> "[" _ rangeSpec _ "]"   {%
                                                              (d, l) => {
                                                                const range = d[2]
                                                                return {
                                                                  ...range,
                                                                  location: l,
                                                                  length: lengthOf(d)
                                                                }
                                                              }
                                                              %}

rangeSpec -> expression rangeParcelSeparator expression       {%
                                                              (d, l) => {
                                                                return {
                                                                  type: 'range',
                                                                  args: [
                                                                    d[0],
                                                                    d[2]
                                                                  ],
                                                                  location: l,
                                                                  length: lengthOf(d)
                                                                }
                                                              }
                                                              %}

rangeParcelSeparator -> ((__ "through" __)  | (_ ".." _))         {%
                                                              (d, l) => ({
                                                                location: l,
                                                                length: lengthOf(d[0][0])
                                                              })
                                                              %}