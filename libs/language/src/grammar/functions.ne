@lexer tokenizer

###########################
### Function definition ###
###########################

functionDef -> "function" ___ functionDefName _ functionDefArgs _ "=>" _ functionBody {%
                                                        (d) => addArrayLoc({
                                                          type: "function-definition",
                                                          args: [
                                                            d[2],
                                                            d[4],
                                                            d[8]
                                                          ]
                                                        }, d)
                                                        %}

functionDefName -> identifier                           {%
                                                        (d) => addLoc({
                                                          type: 'funcdef',
                                                          args: [d[0].name],
                                                        }, d[0])
                                                        %}

functionDefArgs  -> "(" _ argName (optionalComma argName):* _ ")" {%
                                                        (d) => addArrayLoc({
                                                          type: 'argument-names',
                                                          args: [d[2], ...d[3].map(([_comma, arg]) => arg)],
                                                        }, d)
                                                        %}

optionalComma    -> (_ "," _ | __)                      {% id %}

argName -> identifier                                   {%
                                                        (d) => addLoc({
                                                          type: 'def',
                                                          args: [d[0].name],
                                                        }, d[0])
                                                        %}

functionBody -> expression                              {%
                                                        ([exp]) => addLoc({
                                                          type: 'block',
                                                          args: [exp],
                                                        }, exp)
                                                        %}


#####################
### Function call ###
#####################

functionCall -> identifier _ callArgs                   {%
                                                        (d) => {
                                                          const func = d[0]
                                                          const args = d[2]

                                                          return addArrayLoc({
                                                            type: 'function-call',
                                                            args: [
                                                              addLoc({
                                                                type: 'funcref',
                                                                args: [func.name],
                                                              }, func),
                                                              addLoc({
                                                                type: 'argument-list',
                                                                args: args.args,
                                                              }, args),
                                                            ],
                                                          }, d)
                                                        }
                                                        %}

callArgs -> "(" _ expression (_ "," _ expression):* _ ")"   {%
                                                        (d) => addArrayLoc({
                                                          type: 'argument-list',
                                                          args: [d[2], ...d[3].map(([_ws, _comma, _ws2, arg]) => arg)],
                                                        }, d)
                                                        %}
