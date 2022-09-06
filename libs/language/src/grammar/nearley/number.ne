@lexer tokenizer
@{%

import Fraction, { toFraction } from '@decipad/fraction';

function makeNumber(parentNode, n, numberFormat = undefined) {
  const fraction = toFraction(n);

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
                                                          return makeNumber(d, toFraction(d[1].n).neg());
                                                        }
                                                        %}

percentage -> "-" decimal _ "%"                         {%
                                                        (d) => {
                                                          const n = toFraction((d[1].n).neg()).div(toFraction(100));
                                                          return makeNumber(d, n, 'percentage');
                                                        }
                                                        %}

percentage -> decimal _ "%"                             {%
                                                        (d) => {
                                                          const n = toFraction((d[0].n)).div(toFraction(100));
                                                          return makeNumber(d, n, 'percentage');
                                                        }
                                                        %}

permille -> "-" decimal "‰"                             {%
                                                        (d) => {
                                                          return makeNumber(d, toFraction((d[1].n).neg()).div(toFraction(1000)))
                                                        }
                                                        %}

permille -> decimal "‰"                                 {%
                                                        (d) => {
                                                          return makeNumber(d, toFraction((d[0].n)).div(toFraction(1000)))
                                                        }
                                                        %}

permyriad -> "-" decimal "‱"                          {%
                                                        (d) => {
                                                          return makeNumber(d, toFraction((d[1].n).neg()).div(toFraction(10000)))
                                                        }
                                                        %}

permyriad -> decimal "‱"                              {%
                                                        (d) => {
                                                          return makeNumber(d, toFraction((d[0].n)).div(toFraction(10000)))
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
                                                          if (/[.eE]/.test(number.value)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({
                                                              n: BigInt(number.value)
                                                            }, number)
                                                          }
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
                                                          if (/[eE]/.test(number.value)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({
                                                              n: toFraction(number.value)
                                                            }, number)
                                                          }
                                                        }
                                                        %}
