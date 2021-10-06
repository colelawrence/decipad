@lexer tokenizer

@{%
const abbreviatedPrefixes = {
  "y": "yocto",
  "z": "zepto",
  "a": "atto",
  "f": "femto",
  "p": "pico",
  "n": "nano",
  "μ": "micro",
  "m": "milli",
  "c": "centi",
  "d": "deci",
  "da": "deca",
  "h": "hecto",
  "k": "kilo",
  "M": "mega",
  "G": "giga",
  "T": "tera",
  "P": "peta",
  "E": "exa",
  "Z": "zetta",
  "Y": "yotta",
}

const multiplierPrefixes = {
  "yocto": 1e-24,
  "zepto": 1e-21,
  "atto": 1e-18,
  "femto": 1e-15,
  "pico": 1e-12,
  "nano": 1e-9,
  "micro": 1e-6,
  "milli": 1e-3,
  "centi": 1e-2,
  "deci": 1e-1,
  "deca": 1e1,
  "hecto": 1e2,
  "kilo": 1e3,
  "mega": 1e6,
  "giga": 1e9,
  "tera": 1e12,
  "peta": 1e15,
  "exa": 1e18,
  "zetta": 1e21,
  "yotta": 1e24,
}

const trimPrefix = unitName => {
  if (unitName.startsWith('da')) {
    return [multiplierPrefixes.deca, unitName.slice(2)]
  } else if (unitName[0] in abbreviatedPrefixes) {
    const prefix = abbreviatedPrefixes[unitName[0]]
    return [multiplierPrefixes[prefix], unitName.slice(1)]
  } else {
    for (const [prefix, multiplier] of Object.entries(multiplierPrefixes)) {
      if (unitName.startsWith(prefix)) {
        return [multiplier, unitName.slice(prefix.length)]
      }
    }
    return [1, unitName]
  }
}

const parseUnit = unitString => {
  if (knownUnits.has(unitString)) {
    return {
      unit: unitString,
      exp: 1,
      multiplier: 1,
      known: true
    }
  } else {
    let [multiplier, name] = trimPrefix(unitString)
    const known = knownUnits.has(name)

    if (!known) {
      name = unitString
      multiplier = 1
    }

    return {
      unit: name,
      exp: 1,
      multiplier,
      known
    }
  }
}
%}

units -> unit                                           {%
                                                        ([u]) =>
                                                          addLoc({ units: [u] }, u)
                                                        %}

units -> unit "*" units                                 {%
                                                        (d) =>
                                                          addArrayLoc({
                                                            units: [d[0], ...d[2].units],
                                                          }, d)
                                                        %}

units -> unit "/" units                                 {%
                                                        (d) => {
                                                          const [second, ...rest] = d[2].units

                                                          return addArrayLoc({
                                                            units: [
                                                              d[0],
                                                              { ...second, exp: -second.exp },
                                                              ...rest
                                                            ],
                                                          }, d)
                                                        }
                                                        %}

unit -> unitName                                        {% id %}

unitName -> %identifier                                 {%
                                                        ([ident]) =>
                                                          addLoc(parseUnit(ident.value), ident)
                                                        %}

unit -> unitName "^" int                                {%
                                                        ([unit, _, exponent]) => {
                                                          unit.exp *= exponent.n
                                                          return addLoc(unit, unit, exponent)
                                                        }
                                                        %}
