
@lexer tokenizer

assign              -> assignTarget spacedEq assignable {%
                                                        (d) => addArrayLoc({
                                                          type: 'assign',
                                                          args: [d[0], d[2]]
                                                        }, d)
                                                        %}

assignable          -> expression                       {% id %}
assignable          -> table                            {% id %}

spacedEq            -> _ "=" _                          {% id %}

assignTarget        -> identifier                       {%
                                                        (d) => {
                                                          return addLoc({
                                                            type: 'def',
                                                            args: [d[0].name]
                                                          }, d[0])
                                                        }
                                                        %}
