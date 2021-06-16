###################
### Import Data ###
###################

importData -> "import_data" __ dqstring     {%
                                            (d, l) => {
                                              return {
                                                type: 'imported-data',
                                                args: [d[2]],
                                                location: l,
                                                length: lengthOf(d)
                                              }
                                            }
                                            %}
