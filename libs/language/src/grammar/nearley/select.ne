@lexer tokenizer

select -> "select" _ "(" _ selectedColumns _ ")"            {%
                                                            (d) => {
                                                              const ref = d[4];

                                                              return addArrayLoc({
                                                                type: 'directive',
                                                                args: ['select', ...ref]
                                                              }, d);
                                                            }
                                                            %}

selectedColumns -> ref _ ",":? _ (genericIdentifier _ ",":? _):+  {%
                                                            (d) => {
                                                              const ref = d[0];
                                                              const cols = addArrayLoc({
                                                                type: 'generic-list',
                                                                args: d[4].map(([ident]) => ident)
                                                              }, d[4])

                                                              return [ref, cols];
                                                            }
                                                            %}
