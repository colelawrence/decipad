@lexer lexer

###################
### White space ###
###################

# Optional whitespace
_  -> %ws:? {% id %}

# Mandatory whitespace
__ -> %ws   {% id %}

# Mandatory non-newline whitespace
___ -> %ws  {%
            (d, _l, reject) => {
              if (d[0].value.includes('\n') || d[0].length === 0) {
                return reject
              } else {
                return d[0]
              }
            }
            %}

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
