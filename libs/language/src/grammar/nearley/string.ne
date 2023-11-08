@lexer tokenizer

##############
### String ###
##############

string      -> %string                                  {%
                                                        ([string]) => {
                                                          return addLoc({
                                                            type: 'literal',
                                                            args: ['string', string.value],
                                                          }, string)
                                                        }
                                                        %}

string      -> %altstring                              {%
                                                        ([string]) => {
                                                          return addLoc({
                                                            type: 'literal',
                                                            args: ['string', string.value],
                                                          }, string)
                                                        }
                                                        %}
