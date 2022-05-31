@lexer tokenizer

range -> "range" _ "(" _ rangeInner _ ")"                     {%
                                                              (d) => {
                                                                return addArrayLoc({
                                                                  type: 'range',
                                                                  args: d[4]
                                                                }, d)
                                                              }
                                                              %}

rangeInner -> expression rangeParcelSeparator expression      {%
                                                              ([start, _through, end]) => [start, end]
                                                              %}

rangeParcelSeparator -> _ ("through" | ".." | "to") _         {% () => null %}
