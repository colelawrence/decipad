@lexer tokenizer

#####################
### Time Quantity ###
#####################


timeQuantity -> "[" _ timeQuantityDefParcel (timeQuantityDefParcelSeparator timeQuantityDefParcel):* _ "]" {%
                                                            (d) => {
                                                              const parcel = d[2]
                                                              const moreParcels = (d[3] || []).flatMap(
                                                                ([_ws, parcel]) => parcel
                                                              )

                                                              return addArrayLoc({
                                                                type: 'time-quantity',
                                                                args: [...parcel, ...moreParcels]
                                                              }, d)
                                                            }
                                                            %}

timeQuantityDefParcel -> int __ timeQuantityUnit            {%
                                                            ([quantity, _ws, unit]) =>
                                                              [unit, quantity.n]
                                                            %}

timeQuantityUnit -> identifier                              {%
                                                            ([unitIdent], _l, reject) => {
                                                              const unit = unitIdent.name.replace(/s$/, '')

                                                              if (timeUnitStrings.has(unit)) {
                                                                return unit
                                                              } else {
                                                                return reject
                                                              }
                                                            }
                                                            %}

timeQuantityDefParcelSeparator -> ((_ "," _) | (__ "and" __) | (_ "," _ "and" __)) {% id %}
