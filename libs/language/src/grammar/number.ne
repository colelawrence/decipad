##############
### Number ###
##############

number       -> plainNumber                             {%
                                                        (d, l) => {
                                                          const n = d[0]
                                                          return {
                                                            type: 'literal',
                                                            args: ['number', n.n, null],
                                                            location: l,
                                                            length: n.length
                                                          }
                                                        }
                                                        %}
number      -> plainNumber ___:? units                  {%
                                                        (d, l) => {
                                                          const n = d[0]
                                                          const units = d[2]
                                                          return {
                                                            type: 'literal',
                                                            args: ['number', n.n, d[2].units],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

percentage -> decimal "%"                               {%
                                                        (d, l) => {
                                                          return {
                                                            type: 'literal',
                                                            args: ['number', d[0].n / 100, null],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

plainNumber -> jsonfloat                                {% id %}

int -> ("-"|"+"):? [0-9]:+                              {%
                                                        (d, l) => {
                                                          let n
                                                          if (d[0]) {
                                                              n = parseInt(d[0][0]+d[1].join(""));
                                                          } else {
                                                              n = parseInt(d[1].join(""));
                                                          }

                                                          return {
                                                            n,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}


jsonfloat -> "-":? [0-9]:+ ("." [0-9]:+):? ([eE] [+-]:? [0-9]:+):? {%
                                                        (d, l) => {
                                                          const n = parseFloat(
                                                            (d[0] || "") +
                                                            d[1].join("") +
                                                            (d[2] ? "."+d[2][1].join("") : "") +
                                                            (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : ""))

                                                          return {
                                                            n,
                                                            location: l,
                                                            length: lengthOf([d[0], d[1], d[2] && d[2][0], d[2] && d[2][1], d[3] && d[3][0], d[3] && d[3][1], d[3] && d[3][2]])
                                                          }
                                                        }
                                                        %}

decimal -> "-":? [0-9]:+ ("." [0-9]:+):?                {%
                                                        (d, l) => {
                                                          const n = parseFloat(
                                                            (d[0] || "") +
                                                            d[1].join("") +
                                                            (d[2] ? "."+d[2][1].join("") : ""))

                                                          return {
                                                            n,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

