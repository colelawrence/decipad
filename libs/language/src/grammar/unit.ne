

units -> unit                                           {%
                                                        (d, l) => {
                                                          const u = d[0]
                                                          return {
                                                            units: [u],
                                                            location: l,
                                                            length: u.length
                                                          }
                                                        }
                                                        %}

units -> unit ( "*" ) units                             {%
                                                        (d, l) => {
                                                          return {
                                                            units: [d[0], ...d[2].units],
                                                            location: l,
                                                            length: lengthOf([d[0], d[1][0], d[2]])
                                                          }
                                                        }
                                                        %}

units -> unit ("/" | __ "per" __) units                 {%
                                                        (d, l) => {
                                                          let [second, ...rest] = d[2].units
                                                          second = {
                                                            unit: second.unit,
                                                            exp: -second.exp,
                                                            multiplier: second.multiplier,
                                                            known: second.known,
                                                            location: second.location,
                                                            length: second.length
                                                          }
                                                          return {
                                                            units: [d[0], second, ...rest],
                                                            location: l,
                                                            length: lengthOf([d[0], d[1][0], d[2]])
                                                          }
                                                        }
                                                        %}

unit -> simpleunit                                      {% id %}

simpleunit -> multiplierprefix knownUnitName            {%
                                                        (d, l) => {
                                                          const mult = d[0]
                                                          return {
                                                            unit: d[1],
                                                            exp: 1,
                                                            multiplier: mult.multiplier,
                                                            known: true,
                                                            location: l,
                                                            length: mult.length + d[1].length
                                                          }
                                                        }
                                                        %}

knownUnitName -> [°a-zA-Z]:+                            {%
                                                        (d, l, reject) => {
                                                          const candidate = d[0].join('')
                                                          if (!knownUnits.has(candidate)) {
                                                            return reject
                                                          }
                                                          return candidate
                                                        }
                                                        %}

simpleunit -> unknownUnitName                           {% id %}

unknownUnitName -> [yzafpnμmcdhkMGTPEZY] [a-zA-Z]:*     {%
                                                        (d, l, reject) => {
                                                          const rest = d[1].join('')
                                                          if (knownUnits.has(rest) || reservedWords.has(rest)) {
                                                            return reject
                                                          }
                                                          const all = d[0] + rest
                                                          if (knownUnits.has(all) || reservedWords.has(all)) {
                                                            return reject
                                                          }

                                                          return {
                                                            unit: all,
                                                            exp: 1,
                                                            multiplier: 1,
                                                            known: false,
                                                            location: l,
                                                            length: all.length
                                                          }
                                                        }
                                                        %}
unknownUnitName -> [^yzafpnμmcdhkMGTPEZY0-9=+\%*\- ] [a-zA-Z]:*    {%
                                                        (d, l, reject) => {
                                                          if (!/^[°a-zA-Z]$/.test(d[0])) {
                                                            // Must not be a known multiplier prefix,
                                                            // but needs to be a valid unit name
                                                            return reject
                                                          }

                                                          const candidate = d[0] + d[1].join('')
                                                          if (knownUnits.has(candidate) || reservedWords.has(candidate)) {
                                                            return reject
                                                          }

                                                          return {
                                                            unit: candidate,
                                                            exp: 1,
                                                            multiplier: 1,
                                                            known: false,
                                                            location: l,
                                                            length: candidate.length
                                                          }
                                                        }
                                                        %}

multiplierprefix -> null                                {% (d, l) => ({ multiplier: 1, location: l, length: 0 }) %}
multiplierprefix -> ("y" | "yocto")                     {% (d, l) => ({ multiplier: 1e-24, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("z" | "zepto")                     {% (d, l) => ({ multiplier: 1e-21, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("a" | "atto")                      {% (d, l) => ({ multiplier: 1e-18, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("f" | "femto")                     {% (d, l) => ({ multiplier: 1e-15, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("p" | "pico")                      {% (d, l) => ({ multiplier: 1e-12, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("n" | "nano")                      {% (d, l) => ({ multiplier: 1e-9, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("μ" | "micro")                     {% (d, l) => ({ multiplier: 1e-6, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("m" | "milli")                     {% (d, l) => ({ multiplier: 1e-3, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("c" | "centi")                     {% (d, l) => ({ multiplier: 1e-2, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("d" | "deci")                      {% (d, l) => ({ multiplier: 1e-1, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("da" | "deca")                     {% (d, l) => ({ multiplier: 1e1, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("h" | "hecto")                     {% (d, l) => ({ multiplier: 1e2, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("k" | "kilo")                      {% (d, l) => ({ multiplier: 1e3, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("M" | "mega")                      {% (d, l) => ({ multiplier: 1e6, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("G" | "giga")                      {% (d, l) => ({ multiplier: 1e9, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("T" | "tera")                      {% (d, l) => ({ multiplier: 1e12, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("P" | "peta")                      {% (d, l) => ({ multiplier: 1e15, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("E" | "exa")                       {% (d, l) => ({ multiplier: 1e18, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("Z" | "zetta")                     {% (d, l) => ({ multiplier: 1e21, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("Y" | "yotta")                     {% (d, l) => ({ multiplier: 1e24, location: l, length: d[0][0].length}) %}

unit -> simpleunit "^" int                              {%
                                                        (d, l) => {
                                                          const u = d[0]
                                                          const n = d[2]
                                                          return Object.assign(d[0], {
                                                            exp: u.exp * n.n,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          })
                                                        }
                                                        %}



