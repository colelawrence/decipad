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
%}

##################
### Expression ###
##################


expression    -> overExp                                {% id %}
expression    -> fetchData                              {% id %}

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
asExp         -> asExp _ ("as" | "to" | "in") _ orOp    {%
                                                        (d) => {
                                                          const exp = d[0]
                                                          const unit = d[4]
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['as', exp, unit],
                                                          }, d);
                                                        }
                                                        %}

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




divMulOp           -> ofExp                             {% id %}
divMulOp           -> divMulOp _ divMulOperator _ ofExp {% basicBinop %}
divMulOp           -> divMulOp ref                      {% implicitMultHandler %}
divMulOp           -> divMulOp __  ofExp                {% implicitMultHandler %}

ofExp         -> powOp                                  {% id %}
ofExp         -> ofExp _ "of" _ genericIdentifier       {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['of', d[0], d[4]]
                                                          }, d)
                                                        }
                                                        %}


powOp              -> primary                           {% id %}
powOp              -> primary _ powOperator _ powOp     {% basicBinop %}

primary            -> literal                           {% id %}
primary            -> functionCall                      {% id %}
primary            -> select                            {% id %}
primary            -> matrixRef                         {% id %}
primary            -> ref                               {% id %}
primary            -> currency                          {% id %}
primary            -> parenthesizedExpression           {% id %}

primary            -> "-" _ parenthesizedExpression     {% unaryMinusHandler %}
primary            -> "-" _ ref                         {% unaryMinusHandler %}

primary            -> ("!" | "not") _ expression        {%
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

primary       -> (ref | functionCall | parenthesizedExpression | select) _ "." _ %identifier {%
                                                        (d) =>
                                                          addArrayLoc({
                                                            type: 'property-access',
                                                            args: [
                                                              d[0][0],
                                                              d[4].value
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
divMulOperator     -> ("*" | "/" | "contains")          {% simpleOperator %}
divMulOperator     -> __ ("%" | "mod" | "modulo")       {%
                                                        (d) => {
                                                          return addArrayLoc({ name: '%' }, d)
                                                        }
                                                        %}

powOperator        -> ("**" | "^")                      {% simpleOperator %}
