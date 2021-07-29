#############
### Table ###
#############

table -> "{" tableColDef "}"                            {%
                                                        (d, l) => {
                                                          return {
                                                            type: 'table',
                                                            args: d[1].coldefs,
                                                            location: l,
                                                            length: lengthOf(d)
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

tableOneColDef -> identifier                         {%
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

tableOneColDef -> identifier _ "=" _ expression      {%
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
