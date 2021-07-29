###########################
### Function definition ###
###########################

functionDef -> "function" ___ functionDefName _ functionDefArgs _ "=>" _ functionBody {%
                                                        (d, l) => ({
                                                          type: "function-definition",
                                                          args: [
                                                            d[2],
                                                            d[4],
                                                            d[8]
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

functionDefName -> identifier                           {%
                                                        (d, l, reject) => ({
                                                          type: 'funcdef',
                                                          args: [d[0].name],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

functionDefArgs  -> "(" _ argName (optionalComma argName):* _ ")" {%
                                                        (d, l) => ({
                                                          type: 'argument-names',
                                                          args: [d[2], ...d[3].map(([_comma, arg]) => arg)],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

optionalComma    -> _ "," _                             {% id %}
optionalComma    -> __                                  {% id %}

argName -> identifier                                   {%
                                                        (d, l) => ({
                                                          type: 'def',
                                                          args: [d[0].name],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

functionBody -> statement                               {%
                                                        (d, l) => ({
                                                          type: 'block',
                                                          args: [d[0]],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}


#####################
### Function call ###
#####################

functionCall -> identifier _ callArgs                   {%
                                                        (d, l) => {
                                                          const func = d[0]
                                                          const args = d[2]

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [func.name],
                                                                location: func.location,
                                                                length: func.length
                                                              },
                                                              {
                                                                type: 'argument-list',
                                                                args: args.args,
                                                                location: args.location,
                                                                length: args.length
                                                              }
                                                            ],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

callArgs -> "(" _ expression (_ "," _ expression):* _ ")"   {%
                                                        (d, l) => ({
                                                          type: 'argument-list',
                                                          args: [d[2], ...d[3].map(([_ws, _comma, _ws2, arg]) => arg)],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
