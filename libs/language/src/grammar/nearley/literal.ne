@lexer tokenizer

###############
### Literal ###
###############

literal          -> number                                   {% id %}
literal          -> noNumLiteral                             {% id %}

noNumLiteral     -> boolean                                  {% id %}
noNumLiteral     -> string                                   {% id %}
noNumLiteral     -> percentage                               {% id %}
noNumLiteral     -> permille                                 {% id %}
noNumLiteral     -> permyriad                                {% id %}
noNumLiteral     -> column                                   {% id %}
noNumLiteral     -> date                                     {% id %}
noNumLiteral     -> range                                    {% id %}
noNumLiteral     -> sequence                                 {% id %}

boolean     -> "true"                                   {%
                                                        (d) => addLoc({
                                                          type: 'literal',
                                                          args: ['boolean', true],
                                                        }, d[0])
                                                        %}

boolean     -> "false"                                  {%
                                                        (d) => addLoc({
                                                          type: 'literal',
                                                          args: ['boolean', false],
                                                        }, d[0])
                                                        %}
