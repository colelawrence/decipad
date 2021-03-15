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
                                                        (d, l) => {

                                                         const exp1 = d[2]
                                                         const elems = [exp1]
                                                         let length  = lengthOf([d[0], d[1], d[2]])

                                                         for (const e of d[3]) {
                                                           const [s1, c, s2, expr] = e
                                                           elems.push(expr)
                                                           length += lengthOf(e)
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