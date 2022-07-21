@lexer tokenizer

#############
### Match ###
#############

match -> "match" _ "{" matchContents "}"                {%
                                                        (d) => addArrayLoc({
                                                            type: 'match',
                                                            args: d[3],
                                                          }, d)
                                                        %}

matchContents -> _                                      {% (d) => [] %}

matchContents -> _ matchDef (matchDefSep matchDef):* _  {%
                                                        (d) => {
                                                          const [_ws, first, rest] = d
                                                          const matchdefs = [first]

                                                          for (const [_sep, matchdef] of rest ?? []) {
                                                            matchdefs.push(matchdef)
                                                          }

                                                          return matchdefs
                                                        }
                                                        %}

matchDef -> expression _ ":" _ expression              {%
                                                        (d) => addArrayLoc({
                                                            type: 'matchdef',
                                                            args: [d[0], d[4]]
                                                          }, d)
                                                        %}

matchDefSep -> (__n | _ "," _)                         {% id %}
