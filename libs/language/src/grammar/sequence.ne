@lexer tokenizer

sequence -> "[" _ sequenceInner _ "]"                   {%
                                                        (d) => addArrayLoc(d[2], d)
                                                        %}

sequenceInner -> expression sequenceThrough expression sequenceBy {%
                                                        (d) => {
                                                          const [start, _through, end, by] = d

                                                          const args = [ start, end ]
                                                          if (by) {
                                                            args.push(by)
                                                          }

                                                          return addArrayLoc(
                                                            { type: 'sequence', args },
                                                            d
                                                          )
                                                        }
                                                        %}

sequenceBy -> (_ "by" _ expression):?                   {%
                                                        (d) => d[0]?.[3] ?? null
                                                        %}

sequenceThrough -> _ ("through" | "..") _               {% () => null %}
