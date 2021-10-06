@lexer tokenizer

###############
### Literal ###
###############

literal     -> boolean                                  {% id %}
literal     -> string                                   {% id %}
literal     -> number                                   {% id %}
literal     -> percentage                               {% id %}
literal     -> timeQuantity                             {% id %}
literal     -> column                                   {% id %}
literal     -> date                                     {% id %}
literal     -> range                                    {% id %}
literal     -> sequence                                 {% id %}

boolean     -> "true"                                   {%
                                                        (d) => addLoc({
                                                          type: 'literal',
                                                          args: ['boolean', true, null],
                                                        }, d[0])
                                                        %}

boolean     -> "false"                                  {%
                                                        (d) => addLoc({
                                                          type: 'literal',
                                                          args: ['boolean', false, null],
                                                        }, d[0])
                                                        %}
