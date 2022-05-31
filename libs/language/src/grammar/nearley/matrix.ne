@lexer tokenizer

matrixMatchers      -> "[" _ matrixMatchersInner _ ",":? _ "]"  {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'matrix-matchers',
                                                            args: [...d[2]]
                                                          }, d)
                                                        }
                                                        %}

matrixMatchersInner -> matcherExp                       {% d => [d[0]] %}
matrixMatchersInner -> matrixMatchersInner (_ "," _) matcherExp {%
                                                        ([accum, _, exp]) =>
                                                          [...accum, exp]
                                                        %}

matrixAssign        -> assignTarget _ matrixMatchers spacedEq expression {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'matrix-assign',
                                                            args: [d[0], d[2], d[4]]
                                                          }, d)
                                                        }
                                                        %}

matrixRef           -> ref matrixMatchers               {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'matrix-ref',
                                                            args: [d[0], d[1]]
                                                          }, d)
                                                        }
                                                        %}

matcherExp          -> ref                              {% id %}
matcherExp          -> ref _ "==" _ expression          {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'function-call',
                                                            args: [
                                                              addArrayLoc({
                                                                type: 'funcref',
                                                                args: ['==']
                                                              }, d),
                                                              addArrayLoc({
                                                                type: 'argument-list',
                                                                args: [
                                                                  d[0],
                                                                  d[4]
                                                                ]
                                                              }, d)
                                                            ]
                                                          }, d)
                                                        }
                                                        %}

