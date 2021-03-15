###############
### Literal ###
###############

literal     -> boolean                                  {% id %}
literal     -> character                                {% id %}
literal     -> string                                   {% id %}
literal     -> number                                   {% id %}
literal     -> column                                   {% id %}
literal     -> table                                    {% id %}
literal     -> date                                     {% id %}

boolean     -> "true"                                   {%
                                                        (d, l) => ({
                                                          type: 'literal',
                                                          args: ['boolean', true],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
boolean     -> "false"                                  {%
                                                        (d, l) => ({
                                                          type: 'literal',
                                                          args: ['boolean', false],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

character   -> "'"  sstrchar "'"                        {%
                                                        (d, l) => {
                                                          const c = d[0]
                                                          return {
                                                            type: 'literal',
                                                            args: ['char', d[1]],
                                                            location: l,
                                                            length: 2 + c.length
                                                          }
                                                        }
                                                        %}