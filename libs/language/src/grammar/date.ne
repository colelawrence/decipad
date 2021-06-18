############
### Date ###
############

@{%
const returnMonth = (month) => (d, l) => {
  let obj = d[0]
  if (Array.isArray(obj)) {
    obj = obj[0]
  }
  return [month, obj.length]
}

const joinDateParts = (dateParts) => {
  let parts = dateParts.args

  if (dateParts.next) {
    parts = parts.concat(joinDateParts(dateParts.next))
  }

  // Timezone is last, always
  if (dateParts.timezone) {
    parts = parts.concat(dateParts.timezone)
  }

  return parts
}
%}

date -> "date" _ "(" _ dateInner _ ")"                  {%
                                                        (d, l) => {
                                                          return {
                                                            type: 'date',
                                                            args: joinDateParts(d[4]),
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

dateInner -> dateYear dateInnerMonth:?                  {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[0].year,
                                                          ],
                                                          next: d[1],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

dateInnerMonth -> dateSeparator dateMonth dateInnerDay:? {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'month',
                                                            d[1].month,
                                                          ],
                                                          next: d[2],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

dateInnerDay -> dateSeparator dateDay dateInnerHour:?   {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'day',
                                                            d[1].day
                                                          ],
                                                          next: d[2],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

dateInnerHour -> (" " | "T") dateHour dateInnerMinute:? dateTimeZone:? {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'hour',
                                                            d[1].hour
                                                          ],
                                                          next: d[2],
                                                          timezone: d[3]
                                                            ? ['timezone', d[3].timezone]
                                                            : [],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

dateInnerMinute -> timeSeparator dateMinute dateInnerSecond:? {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: ['minute', d[1].minute],
                                                          next: d[2],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

dateInnerSecond -> timeSeparator dateSecond dateInnerMillisecond:? {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'second',
                                                            d[1].second
                                                          ],
                                                          next: d[2],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

dateInnerMillisecond -> millisecondSeparator dateMillisecond {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'millisecond',
                                                            d[1].millisecond
                                                          ],
                                                          next: null,
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

dateYear -> [0-9] [0-9] [0-9] [0-9]                     {%
                                                        (d, l, reject) => {
                                                          return {
                                                            year: parseInt(d.join('')),
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

dateMonth -> [0-9] [0-9]                                {%
                                                        (d, l, reject) => {
                                                          const month = parseInt(d.join(''))
                                                          if (month < 1 || month > 12) {
                                                            return reject
                                                          }
                                                          return {
                                                            month,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

dateMonth -> literalMonth                               {%
                                                        (d, l) => {
                                                          const [month, length] = d[0]
                                                          return {
                                                            month,
                                                            location: l,
                                                            length
                                                          }
                                                        }
                                                        %}

literalMonth -> ("Jan" | "January")                     {% returnMonth(1) %}
literalMonth -> ("Feb" | "February")                    {% returnMonth(2) %}
literalMonth -> ("Mar" | "March")                       {% returnMonth(3) %}
literalMonth -> ("Apr" | "April")                       {% returnMonth(4) %}
literalMonth -> "May"                                   {% returnMonth(5) %}
literalMonth -> ("Jun" | "June")                        {% returnMonth(6) %}
literalMonth -> ("Jul" | "July")                        {% returnMonth(7) %}
literalMonth -> ("Aug" | "August")                      {% returnMonth(8) %}
literalMonth -> ("Sep" | "September")                   {% returnMonth(9) %}
literalMonth -> ("Oct" | "October")                     {% returnMonth(10) %}
literalMonth -> ("Nov" | "November")                    {% returnMonth(11) %}
literalMonth -> ("Dec" | "December")                    {% returnMonth(12) %}

dateDay -> [0-9] [0-9]                                  {%
                                                        (d, l, reject) => {
                                                          const day = parseInt(d.join(''))
                                                          if (day < 1 || day > 31) {
                                                            return reject
                                                          }
                                                          return {
                                                            day,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

dateHour -> [0-9] [0-9]                                 {%
                                                        (d, l, reject) => {
                                                          const hour = parseInt(d.join(''))
                                                          if (hour > 23) {
                                                            return reject
                                                          }
                                                          return {
                                                            hour,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

dateMinute -> [0-9] [0-9]                               {%
                                                        (d, l, reject) => {
                                                          const minute = parseInt(d.join(''))
                                                          if (minute > 59) {
                                                            return reject
                                                          }
                                                          return {
                                                            minute,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

dateSecond -> [0-9] [0-9]                               {%
                                                        (d, l, reject) => {
                                                          const second = parseInt(d.join(''))
                                                          if (second > 59) {
                                                            return reject
                                                          }
                                                          return {
                                                            second,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

dateMillisecond -> [0-9] [0-9] [0-9]                    {%
                                                        (d, l, reject) => {
                                                          return {
                                                            millisecond: parseInt(d.join('')),
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

dateTimeZone -> "Z"                                     {%
                                                        (d, l) => ({
                                                          timezone: {
                                                            hours: 0,
                                                            minutes: 0
                                                          },
                                                          location: l,
                                                          length: 1
                                                        })
                                                        %}

dateTimeZone -> ("+" | "-") int (":" int):?             {%
                                                        (d, l) => {
                                                          let hours = d[1].n
                                                          let minutes = (d[2] && d[2][1].n) || 0

                                                          if (d[0][0] === "-") {
                                                            hours = -hours
                                                            minutes = -minutes
                                                          }

                                                          return {
                                                            timezone: {
                                                              hours,
                                                              minutes
                                                            },
                                                            location: l,
                                                            length: 1 + d[1].length + lengthOf(d[2])
                                                          }
                                                        }
                                                        %}


dateSeparator -> ("-" | "/")
timeSeparator -> ":"
millisecondSeparator -> "."
