@lexer tokenizer

#############
### Given ###
#############

given -> "given" __ ref _ ":" _ givenBody         {%
                                                  (d) => {
                                                    return addArrayLoc({
                                                      type: 'given',
                                                      args: [d[2], d[6]],
                                                    }, d)
                                                  }
                                                  %}

givenBody -> table                                {% id %}
givenBody -> expression                           {% id %}