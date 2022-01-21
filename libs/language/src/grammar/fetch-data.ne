@lexer tokenizer

###################
### Fetch Data ###
###################

fetchData -> "fetch" __ %string      {%
                                            (d) => {
                                              return addArrayLoc({
                                                type: 'fetch-data',
                                                args: [d[2].value]
                                              }, d)
                                            }
                                            %}
