@lexer tokenizer

###################
### Import Data ###
###################

importData -> "import_data" __ %string      {%
                                            (d) => {
                                              return addArrayLoc({
                                                type: 'imported-data',
                                                args: [d[2].value]
                                              }, d)
                                            }
                                            %}
