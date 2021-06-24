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

int -> [0-9]:+                                          {%
                                                        (d, l) => {
                                                          return {
                                                            n: parseInt(d[0].join("")),
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}


jsonfloat -> [0-9]:+ ("." [0-9]:+):? ([eE] [+-]:? [0-9]:+):? {%
                                                        (d, l) => {
                                                          const [int, dec, exp] = d
                                                          const n = parseFloat(
                                                            int.join("") +
                                                            (dec ? "." + dec[1].join("") : "") +
                                                            (exp ? "e" + (exp[1] || "+") + exp[2].join("") : ""))

                                                          return {
                                                            n,
                                                            location: l,
                                                            length: lengthOf([
                                                              int,
                                                              ...(dec || []),
                                                              ...(exp || [])
                                                            ])
                                                          }
                                                        }
                                                        %}

decimal -> [0-9]:+ ("." [0-9]:+):?                      {%
                                                        (d, l) => {
                                                          const [int, dec] = d
                                                          const n = parseFloat(
                                                            int.join("") +
                                                            (dec ? "." + dec[1].join("") : ""))

                                                          return {
                                                            n,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

