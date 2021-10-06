@lexer tokenizer

#############
### Given ###
#############

given -> "given" __ ref _ ":" _ expression        {%
                                                  (d) => {
                                                    return addArrayLoc({
                                                      type: 'given',
                                                      args: [d[2], d[6]],
                                                    }, d)
                                                  }
                                                  %}
