@lexer tokenizer

##############
### Column ###
##############

column       -> "[" _ "]"                               {%
                                                        (d) => addLoc({
                                                          type: 'column',
                                                          args: [
                                                            addLoc({
                                                              type: 'column-items',
                                                              args: []
                                                            }, d[1])
                                                          ],
                                                        }, d[0], d[2])
                                                        %}

column       -> "[" colContents "]"                     {%
                                                        (d, _l, reject) => {
                                                          if (d[1].args.every((elem) => (
                                                            elem.type === 'literal' &&
                                                            elem.args[0] === 'number' &&
                                                            elem.args[2]?.args.length === 1 &&
                                                            timeUnitStrings.has(elem.args[2].args[0].unit))
                                                          )) {
                                                            return reject
                                                          } else {
                                                            return addArrayLoc({
                                                              type: 'column',
                                                              args: [d[1]],
                                                            }, d)
                                                          }
                                                        }
                                                        %}

colContents -> _ expression (_ "," _ expression):* _    {%
                                                        (d, _l, reject) => {
                                                          return addArrayLoc({
                                                            type: 'column-items',
                                                            args: [
                                                              d[1],
                                                              ...d[2].map(listItem => listItem[3])
                                                            ]
                                                          }, d)
                                                        }
                                                        %}