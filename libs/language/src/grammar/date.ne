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
%}

date -> "Y" dateYear                                    {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[1].year
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

date -> dateYear dateSeparator dateMonth                {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[0].year,
                                                            'month',
                                                            d[2].month,
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

date -> dateYear dateSeparator dateMonth dateSeparator dateDay {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[0].year,
                                                            'month',
                                                            d[2].month,
                                                            'day',
                                                            d[4].day
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

date -> dateYear dateSeparator dateMonth dateSeparator dateDay (" " | "T") dateHour {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[0].year,
                                                            'month',
                                                            d[2].month,
                                                            'day',
                                                            d[4].day,
                                                            'hour',
                                                            d[6].hour
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

date -> dateYear dateSeparator dateMonth dateSeparator dateDay (" " | "T") dateHour ":" dateMinute {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[0].year,
                                                            'month',
                                                            d[2].month,
                                                            'day',
                                                            d[4].day,
                                                            'hour',
                                                            d[6].hour,
                                                            'minute',
                                                            d[8].minute
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

date -> dateYear dateSeparator dateMonth dateSeparator dateDay (" " | "T") dateHour ":" dateMinute ":" dateSecond {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[0].year,
                                                            'month',
                                                            d[2].month,
                                                            'day',
                                                            d[4].day,
                                                            'hour',
                                                            d[6].hour,
                                                            'minute',
                                                            d[8].minute,
                                                            'second',
                                                            d[10].second
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

date -> dateYear dateSeparator dateMonth dateSeparator dateDay (" " | "T") dateHour ":" dateMinute ":" dateSecond dateTimeZone {%
                                                        (d, l) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[0].year,
                                                            'month',
                                                            d[2].month,
                                                            'day',
                                                            d[4].day,
                                                            'hour',
                                                            d[6].hour,
                                                            'minute',
                                                            d[8].minute,
                                                            'second',
                                                            d[10].second,
                                                            'timezone',
                                                            d[11].timezone
                                                          ],
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


dateSeparator -> [\-/]
