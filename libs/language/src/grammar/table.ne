@lexer tokenizer

#############
### Table ###
#############

table -> "{" tableContents "}"                          {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'table',
                                                            args: d[1],
                                                          }, d)
                                                        }
                                                        %}

tableContents -> _                                      {% (d) => [] %}

tableContents -> _ tableItem (tableSep tableItem):* _   {%
                                                        ([_ws, first, rest]) => {
                                                          const coldefs = [first]

                                                          for (const [_sep, coldef] of rest ?? []) {
                                                            coldefs.push(coldef)
                                                          }

                                                          return coldefs
                                                        }
                                                        %}

tableItem -> identifier                                 {%
                                                        ([ref]) => {
                                                          return addLoc({
                                                            type: 'table-column',
                                                            args: [
                                                              addLoc({ type: 'coldef', args: [ref.name] }, ref),
                                                              addLoc({ type: 'ref', args: [ref.name] }, ref),
                                                            ]
                                                          }, ref)
                                                        }
                                                        %}

tableItem -> "..." ref                                  {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'table-spread',
                                                            args: [d[1]]
                                                          }, d)
                                                        }
                                                        %}

tableItem -> identifier _ "=" _ expression              {%
                                                        (d) => {
                                                          const ref = d[0]

                                                          const colDef = addLoc({
                                                            type: 'coldef',
                                                            args: [ref.name],
                                                          }, ref)

                                                          return addArrayLoc({
                                                            type: 'table-column',
                                                            args: [colDef, d[4]]
                                                          }, d)
                                                        }
                                                        %}

tableItem -> identifier _ tableFormulaArg _ "=" _ expression  {%
                                                        (d) => {
                                                          const [theDef, , rowArgName, , , , body] = d

                                                          const colDef = addLoc({
                                                            type: 'coldef',
                                                            args: [theDef.name],
                                                          }, theDef)

                                                          return addArrayLoc({
                                                            type: 'table-formula',
                                                            args: [
                                                              colDef,
                                                              rowArgName,
                                                              addArrayLoc({
                                                                type: 'block',
                                                                args: [body]
                                                              }, body)
                                                            ]
                                                          }, d)
                                                        }
                                                        %}

tableFormulaArg -> "(" _ identifier _ ")"               {%
                                                        (d) => {
                                                          const ident = d[2]
                                                          return addLoc({
                                                            type: 'def',
                                                            args: [ident.name]
                                                          }, ident)
                                                        }
                                                        %}

tableSep -> (__n | _ "," _)                             {% id %}
