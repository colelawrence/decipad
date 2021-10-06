@lexer tokenizer

range -> "[" _ rangeSpec _ "]"   {%
                                                              (d) => {
                                                                const range = d[2]
                                                                return addArrayLoc(range, d)
                                                              }
                                                              %}

rangeSpec -> expression rangeParcelSeparator expression       {%
                                                              (d) => {
                                                                return addArrayLoc({
                                                                  type: 'range',
                                                                  args: [ d[0], d[2] ],
                                                                }, d)
                                                              }
                                                              %}

rangeParcelSeparator -> _ ("through" | "..") _                {% () => null %}
