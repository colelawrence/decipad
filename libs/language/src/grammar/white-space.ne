###################
### White space ###
###################

_  -> wschar:*  {% id %}
__ -> wschar:+  {% id %}
___ -> [ \t]:+  {% id %}
__n -> wschar:+ {%
                (d, l, reject) => {
                  if (!d[0].includes('\n')) {
                    return reject
                  } else {
                    return '\n'
                  }
                }
                %}

wschar -> [ \t\n\v\f] {% id %}
