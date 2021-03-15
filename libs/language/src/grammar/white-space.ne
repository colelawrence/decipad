###################
### White space ###
###################

_  -> wschar:* {% id %}
__ -> wschar:+ {% id %}
___ -> [ \t]:+ {% id %}

wschar -> [ \t\n\v\f] {% id %}