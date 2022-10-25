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
                                                            }, d[1] ?? d[0])
                                                          ],
                                                        }, d[0], d[2])
                                                        %}

column       -> "[" columnItems "]"                     {%
                                                        (d, _l, reject) => {
                                                          return addArrayLoc({
                                                            type: 'column',
                                                            args: [d[1]],
                                                          }, d)
                                                        }
                                                        %}

columnItems -> _ expression (_ "," _ expression):* (_ ","):? _    {%
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
