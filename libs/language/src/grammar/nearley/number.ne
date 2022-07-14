@lexer tokenizer
@{%

import Fraction from '@decipad/fraction';

function makeNumber(parentNode, n) {
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
                                                          return makeNumber(d, new Fraction(d[1].n).neg())
                                                        }
                                                        %}
percentage -> "-" decimal "%"                           {%
                                                        (d) => {
                                                          return makeNumber(d, new Fraction((d[1].n).neg()).div(new Fraction(100)))
                                                        }
                                                        %}
percentage -> decimal "%"                               {%
                                                        (d) => {
                                                          return makeNumber(d, new Fraction((d[0].n)).div(new Fraction(100)))
                                                        }
                                                        %}
permille -> "-" decimal "‰"                             {%
                                                        (d) => {
                                                          return makeNumber(d, new Fraction((d[1].n).neg()).div(new Fraction(1000)))
                                                        }
                                                        %}
permille -> decimal "‰"                                 {%
                                                        (d) => {
                                                          return makeNumber(d, new Fraction((d[0].n)).div(new Fraction(1000)))
                                                        }
                                                        %}
permyriad -> "-" decimal "‱"                            {%
                                                        (d) => {
                                                          return makeNumber(d, new Fraction((d[1].n).neg()).div(new Fraction(10000)))
                                                        }
                                                        %}
permyriad -> decimal "‱"                                {%
                                                        (d) => {
                                                          return makeNumber(d, new Fraction((d[0].n)).div(new Fraction(10000)))
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
                                                              n: new Fraction(number.value)
                                                            }, number)
                                                          }
                                                        }
                                                        %}
