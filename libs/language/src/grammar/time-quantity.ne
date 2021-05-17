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

timeQuantityUnit -> "year" "s":?                            {% (d) => ({unit: "year", length: lengthOf(d) }) %}
timeQuantityUnit -> "quarter" "s":?                         {% (d) => ({unit: "quarter", length: lengthOf(d) }) %}
timeQuantityUnit -> "month" "s":?                           {% (d) => ({unit: "month", length: lengthOf(d) }) %}
timeQuantityUnit -> "week" "s":?                            {% (d) => ({unit: "week", length: lengthOf(d) }) %}
timeQuantityUnit -> "day" "s":?                             {% (d) => ({unit: "day", length: lengthOf(d) }) %}
timeQuantityUnit -> "hour" "s":?                            {% (d) => ({unit: "hour", length: lengthOf(d) }) %}
timeQuantityUnit -> "minute" "s":?                          {% (d) => ({unit: "minute", length: lengthOf(d) }) %}
timeQuantityUnit -> "second" "s":?                          {% (d) => ({unit: "second", length: lengthOf(d) }) %}
timeQuantityUnit -> "millisecond" "s":?                     {% (d) => ({unit: "millisecond", length: lengthOf(d) }) %}

timeQuantityDefParcelSeparator -> ((_ "," _) | (__ "and" __) | (_ "," _ "and" __)) {%
                                                            (d, l) => ({
                                                              location: l,
                                                              length: lengthOf(d[0][0])
                                                            })
                                                            %}
