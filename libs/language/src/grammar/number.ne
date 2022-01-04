@lexer tokenizer
@{%

import Fraction from '@decipad/fraction';

function numberLiteralFromUnits(parentNode, n, units) {
  const fraction = n instanceof Fraction ? n : new Fraction(n);

  const node = {
    type: 'literal',
    args: ['number', fraction]
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
number       -> "-" unitlessNumber                      {%
                                                        (d) => {
                                                          return numberLiteralFromUnits(d, new Fraction(d[1].n).neg())
                                                        }
                                                        %}
percentage -> "-" decimal "%"                           {%
                                                        (d) => {
                                                          return addArrayLoc(numberLiteralFromUnits(d, new Fraction((d[1].n).neg()).div(new Fraction(100))), d)
                                                        }
                                                        %}
percentage -> decimal "%"                               {%
                                                        (d) => {
                                                          return addArrayLoc(numberLiteralFromUnits(d, new Fraction((d[0].n)).div(new Fraction(100))), d)
                                                        }
                                                        %}

unitlessNumber -> %number                               {%
                                                        ([number]) => {
                                                          return addLoc({
                                                            n: number.value
                                                          }, number)
                                                        }
                                                        %}

int -> %number                                          {%
                                                        ([number], _l, reject) => {
                                                          if (/[.eE]/.test(number.value)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({
                                                              n: BigInt(number.value)
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
                                                              n: new Fraction(number.value)
                                                            }, number)
                                                          }
                                                        }
                                                        %}
