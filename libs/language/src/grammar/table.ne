#############
### Table ###
#############

tableDef -> referenceName _ "=" _ tableColumnList         {%
                                                        (d, l) => {
                                                          const defSymbol = {
                                                            type: 'tabledef',
                                                            args: [d[0].name],
                                                            location: d[0].location,
                                                            length: d[0].length
                                                          }

                                                          return {
                                                            type: 'table-definition',
                                                            args: [defSymbol, d[4]],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

tableColumnList -> "{" tableColDef "}"                {%
                                                        (d, l) => {
                                                          return {
                                                            type: 'table-columns',
                                                            args: d[1].coldefs,
                                                            location: l,
                                                            length: lengthOf([d[0], d[1], d[2]])
                                                          }
                                                        }
                                                        %}

tableColDef -> _                                        {%
                                                        (d, l) => ({
                                                          coldefs: [],
                                                          location: l,
                                                          length: d[0].length
                                                        })
                                                        %}

tableColDef -> _ tableOneColDef (tableDefSeparator tableOneColDef):* _ {%
                                                        (d, l) => {
                                                          const initial = {
                                                            coldefs: d[1].coldefs,
                                                            location: l,
                                                            length: lengthOf([d[0], d[1], d[3]])
                                                          }

                                                          return d[2].reduce((coldefs, more) => {
                                                            const [_, oneColDef] = more
                                                            return {
                                                              coldefs: [
                                                                ...coldefs.coldefs,
                                                                ...oneColDef.coldefs
                                                              ],
                                                              location: l,
                                                              length: coldefs.length + lengthOf(more)
                                                            }
                                                          }, initial)
                                                        }
                                                        %}

tableOneColDef -> referenceName                         {%
                                                        (d, l) => {
                                                          const ref = d[0]
                                                          return {
                                                            coldefs: [
                                                              {
                                                                type: 'coldef',
                                                                args: [ref.name],
                                                                location: l,
                                                                length: ref.length
                                                              },
                                                              {
                                                                type: 'ref',
                                                                args: [ ref.name ],
                                                                location: l,
                                                                length: ref.length
                                                              }
                                                            ],
                                                            location: l,
                                                            length: ref.length
                                                          }
                                                        }
                                                        %}

tableOneColDef -> referenceName _ "=" _ expression      {%
                                                        (d, l) => {
                                                          const ref = d[0]
                                                          return {
                                                            coldefs: [
                                                              {
                                                                type: 'coldef',
                                                                args: [ref.name],
                                                                location: l,
                                                                length: ref.length
                                                              },
                                                              d[4]
                                                            ],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

tableDefSeparator -> _ "\n" _                           {%
                                                        (d, l) => ({
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
tableDefSeparator -> _ "," _                            {%
                                                        (d, l) => ({
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
