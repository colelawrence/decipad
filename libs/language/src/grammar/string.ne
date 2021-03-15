##############
### String ###
##############


string      -> dqstring                                 {%
                                                        (d, l) => {
                                                          const s = d[0]
                                                          return {
                                                            type: 'literal',
                                                            args: ['string', s],
                                                            location: l,
                                                            length: 2 + s.length
                                                          }
                                                        }
                                                        %}

# Double-quoted string
dqstring -> "\"" dstrchar:* "\"" {% (d) => d[1].join("") %}

dstrchar -> [^\\"\n] {% id %}
    | "\\" strescape {%
    (d) => JSON.parse("\""+d.join("")+"\"")
%}

sstrchar -> [^\\'\n] {% id %}
    | "\\" strescape
        {% (d) => JSON.parse("\""+d.join("")+"\"") %}
    | "\\'"
        {% (d) => "'" %}

strescape -> ["\\/bfnrt] {% id %}
    | "u" [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] {%
    (d) => d.join("")
%}