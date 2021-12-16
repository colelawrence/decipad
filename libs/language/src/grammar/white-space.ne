@lexer tokenizer

###################
### White space ###
###################

# Optional whitespace
_  -> %ws:? {% id %}

# Mandatory whitespace
__ -> %ws   {% id %}

# Newline and allowed surrounding whitespace
__n -> %ws  {%
            (d, _l, reject) => {
              if (!d[0].value.includes('\n')) {
                return reject
              } else {
                return d[0]
              }
            }
            %}
