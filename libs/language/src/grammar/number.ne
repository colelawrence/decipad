@lexer tokenizer
@{%

import Fraction from '@decipad/fraction';

function numberLiteralFromUnits(parentNode, n, units = null) {
  const fraction = n instanceof Fraction ? n : new Fraction(n);

  const node = {
    type: 'literal',
    args: ['number', fraction, units]
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
number      -> unitlessNumber __:? units               {%
                                                        (d) => {
                                                          const [n, _, units] = d;
                                                          return numberLiteralFromUnits(d, n.n, units)
                                                        }
                                                        %}

percentage -> decimal "%"                               {%
                                                        (d) => {
                                                          return numberLiteralFromUnits(d, new Fraction(d[0].n, 100))
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
