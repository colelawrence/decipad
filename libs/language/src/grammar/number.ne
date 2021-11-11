@lexer tokenizer
@{%

import Fraction from 'fraction.js';

function numberLiteralFromUnits(parentNode, n, units = null) {
  const mult = (!units && 1) || units.args
    .map((unit) => unit.multiplier ** (unit.exp || 1))
    .reduce((acc, mult) => acc * mult, 1);

  const fraction = new Fraction(n, 1/mult);

  const node = {
    type: 'literal',
    args: ['number', n, units, fraction]
  };
  if (Array.isArray(parentNode)) {
    return addArrayLoc(node, parentNode);
  }
  return addLoc(node, parentNode);
}

%}

##############
### Number ###
##############

number       -> unitlessNumber                          {%
                                                        ([n]) => {
                                                          return numberLiteralFromUnits(n, n.n);
                                                        }
                                                        %}
number      -> unitlessNumber ___:? units               {%
                                                        (d) => {
                                                          const [n, _, units] = d;
                                                          return numberLiteralFromUnits(d, n.n, units)
                                                        }
                                                        %}

percentage -> decimal "%"                               {%
                                                        (d) => {
                                                          return numberLiteralFromUnits(d, d[0].n / 100)
                                                        }
                                                        %}

unitlessNumber -> %number                               {%
                                                        ([number]) => {
                                                          return addLoc({
                                                            n: parseFloat(number.value)
                                                          }, number)
                                                        }
                                                        %}

int -> %number                                          {%
                                                        ([number], _l, reject) => {
                                                          if (/[.eE]/.test(number.value)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({
                                                              n: parseInt(number.value)
                                                            }, number)
                                                          }
                                                        }
                                                        %}

decimal -> %number                                      {%
                                                        ([number], _l, reject) => {
                                                          if (/[eE]/.test(number.value)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({
                                                              n: parseFloat(number.value)
                                                            }, number)
                                                          }
                                                        }
                                                        %}
