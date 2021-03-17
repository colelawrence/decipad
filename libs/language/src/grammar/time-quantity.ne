#####################
### Time Quantity ###
#####################


timeQuantity -> "[" _ timeQuantityDefParcel (timeQuantityDefParcelSeparator timeQuantityDefParcel):* _ "]" {%
                                                            (d, l) => {
                                                              const parcel = d[2]
                                                              const moreParcels = (d[3] && d[3].map((e) => e[1])) || []
                                                              const length = d[0].length +
                                                                d[1].length +
                                                                parcel.length +
                                                                lengthOf(moreParcels)+
                                                                d[4].length + d[5].length

                                                              return {
                                                                type: 'time-quantity',
                                                                args: [
                                                                  ...parcel.parcel,
                                                                  ...moreParcels.map((parcel) => parcel.parcel).flat()],
                                                                location: l,
                                                                length
                                                              }
                                                            }
%}

timeQuantityDefParcel -> int __ timeQuantityUnit            {%
                                                            (d, l) => {
                                                              return {
                                                                parcel: [d[2].unit, d[0].n],
                                                                location: l,
                                                                length: lengthOf(d)
                                                              }
                                                            }
                                                            %}

timeQuantityUnit -> ("year" | "years")                      {% (d) => ({unit: "years", length: d[0][0].length }) %}
timeQuantityUnit -> ("month" | "months")                    {% (d) => ({unit: "months", length: d[0][0].length }) %}
timeQuantityUnit -> ("week" | "weeks")                      {% (d) => ({unit: "weeks", length: d[0][0].length }) %}
timeQuantityUnit -> ("day" | "days")                        {% (d) => ({unit: "days", length: d[0][0].length }) %}
timeQuantityUnit -> ("hour" | "hours")                      {% (d) => ({unit: "hours", length: d[0][0].length }) %}
timeQuantityUnit -> ("minute" | "minutes")                  {% (d) => ({unit: "minutes", length: d[0][0].length }) %}
timeQuantityUnit -> ("second" | "seconds")                  {% (d) => ({unit: "seconds", length: d[0][0].length }) %}

timeQuantityDefParcelSeparator -> ((_ "," _) | (__ "and" __) | (_ "," _ "and" __)) {%
                                                            (d, l) => ({
                                                              location: l,
                                                              length: lengthOf(d[0][0])
                                                            })
                                                            %}