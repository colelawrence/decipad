@lexer tokenizer

##############
### Number ###
##############

number       -> unitlessNumber                          {%
                                                        ([n]) => {
                                                          return addLoc({
                                                            type: 'literal',
                                                            args: ['number', n.n, null]
                                                          }, n)
                                                        }
                                                        %}
number      -> unitlessNumber ___:? units               {%
                                                        (d) => {
                                                          const n = d[0]
                                                          const units = d[2]
                                                          return addArrayLoc({
                                                            type: 'literal',
                                                            args: ['number', n.n, d[2].units]
                                                          }, d)
                                                        }
                                                        %}

percentage -> decimal "%"                               {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'literal',
                                                            args: ['number', d[0].n / 100, null],
                                                          }, d)
                                                        }
                                                        %}

unitlessNumber -> %number                               {%
                                                        ([number]) => {
                                                          return addLoc({
                                                            n: parseFloat(number.value)
                                                          }, number)
                                                        }
                                                        %}

int -> %number                                          {%
                                                        ([number], _l, reject) => {
                                                          if (/[.eE]/.test(number.value)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({
                                                              n: parseInt(number.value)
                                                            }, number)
                                                          }
                                                        }
                                                        %}

decimal -> %number                                      {%
                                                        ([number], _l, reject) => {
                                                          if (/[eE]/.test(number.value)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({
                                                              n: parseFloat(number.value)
                                                            }, number)
                                                          }
                                                        }
                                                        %}
