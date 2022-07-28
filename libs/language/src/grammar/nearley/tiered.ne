@lexer tokenizer

##############
### Tiered ###
##############

tiered -> tieredKeyword _ expression _ "{" tieredContents "}"             {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'tiered',
                                                            args: [d[2], ...d[5]],
                                                          }, d)
                                                        }
                                                        %}

tieredKeyword -> "tiered" | "tiers" | "sliced" | "slices" {% id %}

tieredContents -> _                                     {% (d) => [] %}

tieredContents -> _ tieredDef (tieredSep tieredDef):* _ {%
                                                        ([_ws, first, rest]) => {
                                                          const tieredDefs = [first]

                                                          for (const [_sep, tieredDef] of rest ?? []) {
                                                            tieredDefs.push(tieredDef)
                                                          }
                                                          return tieredDefs
                                                        }
                                                        %}

tieredDef -> expression _ ":" _ expression              {%
                                                        (d) => addArrayLoc({
                                                          type: 'tiered-def',
                                                          args: [d[0], d[4]]
                                                        }, d)
                                                        %}

tieredSep -> (__n | _ "," _)                            {% id %}
