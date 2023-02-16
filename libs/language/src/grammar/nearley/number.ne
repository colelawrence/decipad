@lexer tokenizer
@{%

import DeciNumber, { N } from '@decipad/number';

function makeNumber(parentNode, n, numberFormat = undefined) {
  const fraction = N(n);

  const node = {
    type: 'literal',
    args: numberFormat ? ['number', fraction, numberFormat] : ['number', fraction],
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

number       -> negPosNumber                            {% id %}

number -> %numberWithScientificNotation                 {%
                                                        (d) => {
                                                          const [significand, exponent] = d[0].text.split(/e|E/);
                                                          const n = N(significand).mul(N(10).pow(N(exponent)));
                                                          return makeNumber(d, n);
                                                        }
                                                        %}

number -> "-" %numberWithScientificNotation             {%
                                                        (d) => {
                                                          const [significand, exponent] = d[1].text.split(/e|E/);
                                                          const n = N(significand).mul(N(10).pow(N(exponent))).neg();
                                                          return makeNumber(d, n);
                                                        }
                                                        %}

number       -> currency negPosNumber                   {%
                                                        (d) => {
                                                          const [currency, num] = d
                                                          return addArrayLoc({
                                                            type: 'function-call',
                                                            args: [
                                                              addArrayLoc({
                                                                type: 'funcref',
                                                                args: ['implicit*']
                                                              }, d),
                                                              addArrayLoc({
                                                                type: 'argument-list',
                                                                args: [currency, num]
                                                              }, d)
                                                            ]
                                                          }, d)
                                                        }
                                                        %}

number       -> negPosNumber currency                   {%
                                                        (d) => {
                                                          const [num, currency] = d
                                                          return addArrayLoc({
                                                            type: 'function-call',
                                                            args: [
                                                              addArrayLoc({
                                                                type: 'funcref',
                                                                args: ['implicit*']
                                                              }, d),
                                                              addArrayLoc({
                                                                type: 'argument-list',
                                                                args: d
                                                              }, d)
                                                            ]
                                                          }, d)
                                                        }
                                                        %}

negPosNumber -> unsignedNumber                          {%
                                                        (d) => {
                                                          return makeNumber(d, d[0].n);
                                                        }
                                                        %}

negPosNumber -> "-" unsignedNumber                      {%
                                                        (d) => {
                                                          return makeNumber(d, N(d[1].n).neg());
                                                        }
                                                        %}

percentage -> "-" decimal _ "%"                         {%
                                                        (d) => {
                                                          const n = N((d[1].n).neg()).div(N(100));
                                                          return makeNumber(d, n, 'percentage');
                                                        }
                                                        %}

percentage -> decimal _ "%"                             {%
                                                        (d) => {
                                                          const n = N((d[0].n)).div(N(100));
                                                          return makeNumber(d, n, 'percentage');
                                                        }
                                                        %}

permille -> "-" decimal "‰"                             {%
                                                        (d) => {
                                                          return makeNumber(d, N((d[1].n).neg()).div(N(1000)))
                                                        }
                                                        %}

permille -> decimal "‰"                                 {%
                                                        (d) => {
                                                          return makeNumber(d, N((d[0].n)).div(N(1000)))
                                                        }
                                                        %}

permyriad -> "-" decimal "‱"                          {%
                                                        (d) => {
                                                          return makeNumber(d, N((d[1].n).neg()).div(N(10000)))
                                                        }
                                                        %}

permyriad -> decimal "‱"                                {%
                                                        (d) => {
                                                          return makeNumber(d, N((d[0].n)).div(N(10000)))
                                                        }
                                                        %}


unsignedNumber -> %number                               {%
                                                        ([number]) => {
                                                          return addLoc({
                                                            n: number.value
                                                          }, number)
                                                        }
                                                        %}

int -> %number                                          {%
                                                        ([number], _l, reject) => {
                                                          return addLoc({
                                                            n: BigInt(number.value)
                                                          }, number)
                                                        }
                                                        %}

int -> "-" int                                          {%
                                                        (d) => {
                                                          const n = -d[1].n
                                                          return addArrayLoc({ n }, d)
                                                        }
                                                        %}

decimal -> %number                                      {%
                                                        ([number], _l, reject) => {
                                                          return addLoc({
                                                            n: N(number.value)
                                                          }, number)
                                                        }
                                                        %}
