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
