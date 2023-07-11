@lexer tokenizer

@{%
const implicitMultHandler = (d, _l, reject) => {
  const left = d[0]
  const right = d[2] || d[1]

  // disambiguate things like `2 - 1` <- this is not `2 * (- 1)`!
  if (right.type === 'function-call') {
    const funcRef = right.args[0];
    if (funcRef.type === 'funcref') {
      const funcName = funcRef.args[0];
      if (funcName === 'unary-') {
        return reject;
      }
    }
  }

  // also things like `2 -1`
  if (right.type === 'literal') {
    if (right.args[0] === 'number' && right.args[1].s == -1) {
      return reject;
    }
  }


  return addArrayLoc({
    type: 'function-call',
    args: [
      addArrayLoc({
        type: 'funcref',
        args: ['implicit*'],
      }, d),
      addArrayLoc({
        type: 'argument-list',
        args: [left, right]
      }, d)
    ],
  }, d)
};

const unaryMinusHandler = (d) => {
  const expr = d[2]
  return addArrayLoc({
    type: 'function-call',
    args: [
      addLoc({
        type: 'funcref',
        args: ['unary-'],
      }, d[0]),
      addLoc({
        type: 'argument-list',
        args: [d[2]],
      }, d[2])
    ],
  }, d)
};

const powHandler = (d, _l, reject) => {
  const left = d[0];
  const right = d[4];

  // disambiguate things like `2 - 1` <- this is not `2 * (- 1)`!
  if (left.type === 'function-call') {
    const funcRef = left.args[0];
    if (funcRef.type === 'funcref') {
      const funcName = funcRef.args[0];
      if (funcName === 'unary-') {
        return reject;
      }
    }
  }
  return basicBinop(d);
};
%}


##################
### Expression ###
##################


expression    -> tiered                                 {% id %}
expression    -> match                                  {% id %}
expression    -> overExp                                {% id %}

overExp       -> asExp                                  {% id %}
overExp       -> overExp _ "over" _ genericIdentifier   {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['over', d[0], d[4]]
                                                          }, d)
                                                        }
                                                        %}

asExp         -> orOp                                   {% id %}
asExp         -> asExp _ asWord _ orOp                  {%
                                                        (d) => {
                                                          const exp = d[0]
                                                          const unit = d[4]
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['as', exp, unit],
                                                          }, d);
                                                        }
                                                        %}
asExp         -> asExp _ asWord _ "%"                   {%
                                                        (d) => {
                                                          const percent = addLoc({
                                                            type: 'generic-identifier',
                                                            args: ['%']
                                                          }, d[4]);
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['as', d[0], percent]
                                                          }, d);
                                                        }
                                                        %}

asWord        -> ("as" | "to" | "in")                   {% id %}

@{%
function basicBinop([left, _spc, op, _spc2, right]) {
  return addLoc({
    type: 'function-call',
    args: [
      addLoc({ type: 'funcref', args: [op.name] }, op),
      addLoc({
        type: 'argument-list',
        args: [left, right]
      }, left, right)
    ],
  }, left, right)
}
%}

orOp          -> andOp                                  {% id %}
orOp          -> orOp      _ orOperator _ andOp         {% basicBinop %}

andOp         -> equalityOp                             {% id %}
andOp         -> andOp _ andOperator _ equalityOp       {% basicBinop %}

equalityOp    -> compareOp                              {% id %}
equalityOp    -> equalityOp _ eqDiffOperator _ compareOp{% basicBinop %}

compareOp     -> smoothOp                               {% id %}
compareOp     -> compareOp _ cmpOperator _ smoothOp     {% basicBinop %}

smoothOp      -> addSubOp                               {% id %}
smoothOp      -> smoothOp _ smoothOperator _ addSubOp   {% basicBinop %}

addSubOp      -> divMulOp                               {% id %}
addSubOp      -> addSubOp _ additiveOperator _ divMulOp {%
                                                        (d, _l, reject) => {
                                                          const left = d[0]
                                                          const op = d[2]
                                                          const right = d[4]

                                                          if (
                                                            (op.name === '+') &&
                                                            (left.type === 'date') &&
                                                            (right.type === 'literal') &&
                                                            (right.args[0] === 'number')
                                                          ) {
                                                            return reject
                                                          }

                                                          return basicBinop(d)
                                                        }
                                                        %}

# e.g. 1 / 2
divMulOp        -> fraction                          {% id %}
# any implicit multiplication that isn't _just_ a fraction e.g. 1kg, 1/2kg
divMulOp        -> notFracImpMulOp                   {% id %}
#  one or more "/" operations that cannot parse as a fraction e.g. 1/kg, kg/1, kg/kg, but not 1/2
divMulOp        -> slashOp                           {% id %}
# any explicit multiplication/division operation expression that doesn't start with the "/" operator (can include "per" etc.)
divMulOp        -> noSlashMulOp                      {% id %}

# division/multiplication operations that don't use "/" at the start
noSlashMulOp    -> fraction _ nonSlashDivMulOperator _ notFracImpMulOp {% basicBinop %}
noSlashMulOp    -> notFracImpMulOp _ nonSlashDivMulOperator _ notFracImpMulOp {% basicBinop %}
noSlashMulOp    -> slashOp _ nonSlashDivMulOperator _ notFracImpMulOp         {% basicBinop %}
noSlashMulOp    -> noSlashMulOp _ divMulOperator _ notFracImpMulOp            {% basicBinop %}

# We can allow `notNum (/ notNum)+`, `num / notNum` here, but must be careful to avoid 
# `num / num` as that is handled as a fraction.
slashOp            -> notNumImpMulOp _ slashOperator _ notFracImpMulOp    {% basicBinop %}
slashOp            -> number _ slashOperator _ notNumPowOp                {% basicBinop %}
slashOp            -> slashOp _ slashOperator _ notFracImpMulOp           {% basicBinop %}

# We use this in place of mulOp where using ordinary mulOp could cause ambiguity e.g. in kg/2/3
notFracImpMulOp    -> ofExp                             {% id %}
notFracImpMulOp    -> fraction ref                      {% implicitMultHandler %}
notFracImpMulOp    -> notFracImpMulOp ref               {% implicitMultHandler %}
notFracImpMulOp    -> fraction __ ofExp                 {% implicitMultHandler %}
notFracImpMulOp    -> notFracImpMulOp __ ofExp          {% implicitMultHandler %}

# There must be at least one "/" for fraction otherwise it's ambiguous with notFracImpMulOp
fraction           -> number _ slashOperator _ number             {% basicBinop %}
fraction           -> fraction _ slashOperator _ number           {% basicBinop %}

# notNumImpMulOp contain a number (e.g. 1kg) but is not entirely a number (e.g. 1) it's used
# at the start of slashOp to ensure that it's not ambiguous with fraction
notNumImpMulOp      -> notNumOfExp                       {% id %}
notNumImpMulOp      -> number ref                       {% implicitMultHandler %}
notNumImpMulOp      -> notNumImpMulOp ref               {% implicitMultHandler %}
notNumImpMulOp      -> number  __ ofExp                 {% implicitMultHandler %}
notNumImpMulOp      -> notNumImpMulOp  __  ofExp        {% implicitMultHandler %}

ofExp         -> powOp                                  {% id %}
ofExp         -> ofExp _ "of" _ genericIdentifier       {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['of', d[0], d[4]]
                                                          }, d)
                                                        }
                                                        %}

notNumOfExp    -> notNumPowOp                             {% id %}
notNumOfExp    -> notNumOfExp _ "of" _ genericIdentifier  {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['of', d[0], d[4]]
                                                          }, d)
                                                        }
                                                        %}

powOp              -> primary                           {% id %}
powOp              -> primary _ powOperator _ powOp     {% powHandler %}

notNumPowOp         -> noNumPrimary                           {% id %}
notNumPowOp         -> primary _ powOperator _ powOp          {% powHandler %}
notNumPowOp         -> noNumPrimary _ powOperator _ powOp     {% powHandler %}

primary            -> number                            {% id %}
primary            -> noNumPrimary                      {% id %}

noNumPrimary       -> noNumLiteral                      {% id %}
noNumPrimary       -> functionCall                      {% id %}
noNumPrimary       -> select                            {% id %}
noNumPrimary       -> matrixRef                         {% id %}
noNumPrimary       -> ref                               {% id %}
noNumPrimary       -> currency                          {% id %}
noNumPrimary       -> parenthesizedExpression           {% id %}

noNumPrimary       -> "-" _ parenthesizedExpression     {% unaryMinusHandler %}
noNumPrimary       -> "-" _ ref                         {% unaryMinusHandler %}

noNumPrimary       -> ("!" | "not") _ expression        {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'function-call',
                                                            args: [
                                                              addLoc({
                                                                type: 'funcref',
                                                                args: ['not'],
                                                              }, d[0][0]),
                                                              addLoc({
                                                                type: 'argument-list',
                                                                args: [d[2]],
                                                              }, d[2])
                                                            ],
                                                          }, d)
                                                        }
                                                        %}

noNumPrimary       -> (ref | functionCall | parenthesizedExpression | select) _ "." _ %identifier {%
                                                        (d) =>
                                                          addArrayLoc({
                                                            type: 'property-access',
                                                            args: [
                                                              d[0][0],
                                                              addLoc({
                                                                type: 'colref',
                                                                args: [d[4].value]
                                                              }, d[4]),
                                                            ]
                                                          }, d)
                                                        %}

# This acts like a precedence black hole, where a composed expression can
# become a primary expression
parenthesizedExpression -> "(" _ expression _ ")"       {% (d) => addArrayLoc(d[2], d) %}


#################
### Operators ###
#################


@{%
function simpleOperator(d) {
  const token = d[0][0]
  return addLoc({ name: token.value }, token)
}
%}

orOperator         -> ("||" | "or")                     {% simpleOperator %}
andOperator        -> ("&&" | "and")                    {% simpleOperator %}
eqDiffOperator     -> ("==" | "!=")                     {% simpleOperator %}
cmpOperator        -> (">" | "<" | "<=" | ">=")         {% simpleOperator %}
smoothOperator     -> ("smooth")                        {% simpleOperator %}
additiveOperator   -> ("-" | "+")                       {% simpleOperator %}
divMulOperator     -> slashOperator                     {% id %}
divMulOperator     -> nonSlashDivMulOperator            {% id %}
# Believe it or not the () around "/" are significant, don't remove them!
slashOperator      -> ("/")                               {% simpleOperator %}
nonSlashDivMulOperator -> ("for" | "*" | "per" | "contains")  {% simpleOperator %}
nonSlashDivMulOperator -> __ ("mod" | "modulo")             {%
                                                        (d) => {
                                                          return addArrayLoc({ name: 'mod' }, d)
                                                        }
                                                        %}

powOperator        -> ("**" | "^")                      {% simpleOperator %}
