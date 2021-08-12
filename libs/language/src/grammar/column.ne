@lexer lexer

##############
### Column ###
##############

column       -> "[" _ "]"                               {%
                                                        (d) => addLoc({
                                                          type: 'column',
                                                          args: [
                                                            []
                                                          ],
                                                        }, d[0], d[2])
                                                        %}

column       -> "[" _ expression (_ "," _ expression):* _ "]" {%
                                                        (d, _l, reject) => {

                                                        const elems = [
                                                          d[2],
                                                          ...d[3].map(listItem => listItem[3])
                                                        ]

                                                        if (elems.every((elem) => {
                                                          return (
                                                            elem.type === 'literal' &&
                                                            elem.args[0] === 'number' &&
                                                            elem.args[2] &&
                                                            elem.args[2].length === 1 &&
                                                            timeUnitStrings.has(elem.args[2][0].unit))
                                                        })) {
                                                          return reject
                                                        } else {
                                                          return addArrayLoc({
                                                            type: 'column',
                                                            args: [ elems ],
                                                          }, d)
                                                        }
                                                      }
                                                      %}
