@lexer tokenizer

############
### Date ###
############

@{%
const returnMonth = (month) => () => ({ month })

const joinDateParts = (dateParts) => {
  let parts = dateParts.args;

  if (dateParts.nextDateInner) {
    parts = parts.concat(joinDateParts(dateParts.nextDateInner))
  }

  // Timezone is last, always
  if (dateParts.timezone) {
    parts = parts.concat(dateParts.timezone)
  }

  return parts
}

const makeDateFragmentReader = (key, len, min, max) => ([{text}], _l, reject) => {
  try {
    const number = BigInt(text)
    if (
      text.length !== len ||
      number < min ||
      number > max
    ) {
      return reject
    } else {
      return { [key]: number }
    }
  } catch (err) {
    return reject;
  }
}
%}

date -> %beginDate _ dateInner _ %endDate               {%
                                                        (d) => {
                                                          return addLoc({
                                                            type: 'date',
                                                            args: joinDateParts(d[2]),
                                                          }, d[0], d[4])
                                                        }
                                                        %}

dateInner -> dateYear dateInnerMonth:?                  {%
                                                        (d) => ({
                                                          type: 'date',
                                                          args: [
                                                            'year',
                                                            d[0].year,
                                                          ],
                                                          nextDateInner: d[1],
                                                        })
                                                        %}

dateInnerMonth -> dateSeparator dateMonth dateInnerDay:? {%
                                                        (d) => ({
                                                          type: 'date',
                                                          args: [
                                                            'month',
                                                            d[1].month,
                                                          ],
                                                          nextDateInner: d[2],
                                                        })
                                                        %}

dateInnerDay -> dateSeparator dateDay dateInnerHour:?   {%
                                                        (d) => ({
                                                          type: 'date',
                                                          args: [
                                                            'day',
                                                            d[1].day
                                                          ],
                                                          nextDateInner: d[2],
                                                        })
                                                        %}

dateInnerHour -> (" " | "T") dateHour dateInnerMinute:? dateTimeZone:? {%
                                                        (d) => ({
                                                          type: 'date',
                                                          args: [
                                                            'hour',
                                                            d[1].hour
                                                          ],
                                                          nextDateInner: d[2],
                                                          timezone: d[3]
                                                            ? ['timezone', d[3].timezone]
                                                            : [],
                                                        })
                                                        %}

dateInnerMinute -> ":" dateMinute dateInnerSecond:?     {%
                                                        (d) => ({
                                                          type: 'date',
                                                          args: ['minute', d[1].minute],
                                                          nextDateInner: d[2],
                                                        })
                                                        %}

dateInnerSecond -> ":" dateSecond dateInnerMillisecond:? {%
                                                        (d) => ({
                                                          type: 'date',
                                                          args: [
                                                            'second',
                                                            d[1].second
                                                          ],
                                                          nextDateInner: d[2],
                                                        })
                                                        %}

dateInnerMillisecond -> "." dateMillisecond             {%
                                                        (d) => ({
                                                          type: 'date',
                                                          args: [
                                                            'millisecond',
                                                            d[1].millisecond
                                                          ],
                                                          nextDateInner: null,
                                                        })
                                                        %}

dateYear -> %digits                                     {% makeDateFragmentReader('year', 4, 0, 9999) %}
dateMonth -> %digits                                    {% makeDateFragmentReader('month', 2, 1, 12) %}
dateMonth -> literalMonth                               {% id %}
dateDay -> %digits                                      {% makeDateFragmentReader('day', 2, 1, 31) %}
dateHour -> %digits                                     {% makeDateFragmentReader('hour', 2, 0, 23) %}
dateMinute -> %digits                                   {% makeDateFragmentReader('minute', 2, 0, 59) %}
dateSecond -> %digits                                   {% makeDateFragmentReader('second', 2, 0, 59) %}
dateMillisecond -> %digits                              {% makeDateFragmentReader('millisecond', 3, 0, 999) %}

literalMonth -> ("Jan" | "January")                     {% returnMonth(1n) %}
literalMonth -> ("Feb" | "February")                    {% returnMonth(2n) %}
literalMonth -> ("Mar" | "March")                       {% returnMonth(3n) %}
literalMonth -> ("Apr" | "April")                       {% returnMonth(4n) %}
literalMonth -> "May"                                   {% returnMonth(5n) %}
literalMonth -> ("Jun" | "June")                        {% returnMonth(6n) %}
literalMonth -> ("Jul" | "July")                        {% returnMonth(7n) %}
literalMonth -> ("Aug" | "August")                      {% returnMonth(8n) %}
literalMonth -> ("Sep" | "September")                   {% returnMonth(9n) %}
literalMonth -> ("Oct" | "October")                     {% returnMonth(10n) %}
literalMonth -> ("Nov" | "November")                    {% returnMonth(11n) %}
literalMonth -> ("Dec" | "December")                    {% returnMonth(12n) %}

dateTimeZone -> "Z"                                     {%
                                                        (d) => ({
                                                          timezone: {
                                                            hours: 0,
                                                            minutes: 0
                                                          },
                                                        })
                                                        %}

dateTimeZone -> ("+" | "-") %digits (":" %digits):?     {%
                                                        ([sign, h, m]) => {
                                                          let hours = Number(h.value)
                                                          let minutes = m ? Number(m[1].value) : 0

                                                          if (sign[0].value === "-") {
                                                            hours = -hours
                                                            minutes = -minutes
                                                          }

                                                          return { timezone: { hours, minutes } }
                                                        }
                                                        %}


dateSeparator -> ("-" | "/")                            {% id %}
