##############
### Column ###
##############

column       -> "[" _ "]"                               {%
                                                        (d, l) => ({
                                                          type: 'column',
                                                          args: [
                                                            []
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
column       -> "[" _ expression (_ "," _ expression):* _ "]" {%
                                                        (d, l, reject) => {

                                                        const exp1 = d[2]
                                                        const elems = [exp1]
                                                        let length  = lengthOf([d[0], d[1], d[2]])

                                                        for (const e of d[3]) {
                                                          const [s1, c, s2, expr] = e
                                                          elems.push(expr)
                                                          length += lengthOf(e)
                                                        }

                                                        if (elems.every((elem) => {
                                                          return (
                                                            elem.type === 'literal' &&
                                                            elem.args[0] === 'number' &&
                                                            elem.args[2] &&
                                                            elem.args[2].length === 1 &&
                                                            timeUnitStrings.has(elem.args[2][0].unit))
                                                        })) {
                                                          return reject
                                                        }

                                                        return {
                                                          type: 'column',
                                                          args: [
                                                            elems
                                                          ],
                                                          location: l,
                                                          length
                                                        }
                                                      }
                                                      %}
