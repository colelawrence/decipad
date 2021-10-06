@lexer tokenizer

#############
### Table ###
#############

table -> "{" tableColDef "}"                            {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'table',
                                                            args: d[1],
                                                          }, d)
                                                        }
                                                        %}

tableColDef -> _                                        {% (d) => [] %}

tableColDef -> _ tableOneColDef (tableDefSeparator tableOneColDef):* _ {%
                                                        ([_ws, first, rest]) => {
                                                          const coldefs = [...first]

                                                          for (const [_sep, coldef] of rest ?? []) {
                                                            coldefs.push(...coldef)
                                                          }

                                                          return coldefs
                                                        }
                                                        %}

tableOneColDef -> identifier                            {%
                                                        ([ref]) => [
                                                          addLoc({ type: 'coldef', args: [ref.name] }, ref),
                                                          addLoc({ type: 'ref', args: [ref.name] }, ref),
                                                        ]
                                                        %}

tableOneColDef -> identifier _ "=" _ expression         {%
                                                        (d) => {
                                                          const ref = d[0]
                                                          return [
                                                            addLoc({
                                                              type: 'coldef',
                                                              args: [ref.name],
                                                            }, ref),
                                                            d[4]
                                                          ]
                                                        }
                                                        %}

tableDefSeparator -> (__n | _ "," _)                    {% id %}
