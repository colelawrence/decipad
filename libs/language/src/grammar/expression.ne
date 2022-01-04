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
      {
        type: 'funcref',
        args: ['*'],
      },
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
expression    -> importData                             {% id %}

overExp       -> asExp                                  {% id %}
overExp       -> overExp _ "over" _ genericIdentifier   {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['over', d[0], d[4]]
                                                          }, d)
                                                        }
                                                        %}

asExp         -> divMulOp                               {% id %}
asExp         -> asExp _ ("as" | "to" | "in") _ divMulOp   {%
                                                        (d) => {
                                                          const exp = d[0]
                                                          const unit = d[4]
                                                          return addArrayLoc({
                                                            type: 'directive',
                                                            args: ['as', exp, unit],
                                                          }, d);
                                                        }
                                                        %}

divMulOp      -> addSubOp                               {% id %}
divMulOp      -> divMulOp _ additiveOperator _ addSubOp {%
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

                                                          return addArrayLoc({
                                                            type: 'function-call',
                                                            args: [
                                                              addLoc({
                                                                type: 'funcref',
                                                                args: [op.name],
                                                              }, op),
                                                              addArrayLoc({
                                                                type: 'argument-list',
                                                                args: [left, right],
                                                              }, d)
                                                            ],
                                                          }, d)
                                                        }
                                                        %}

addSubOp     -> implicitMult                            {% id %}
addSubOp     -> addSubOp _ multOp _ implicitMult        {%
                                                        (d) => {
                                                          const left = d[0]
                                                          const op = d[2]
                                                          const right = d[4]

                                                          return addArrayLoc({
                                                            type: 'function-call',
                                                            args: [
                                                              addLoc({
                                                                type: 'funcref',
                                                                args: [op.name],
                                                              }, op),
                                                              addArrayLoc({
                                                                type: 'argument-list',
                                                                args: [left, right]
                                                              }, d)
                                                            ],
                                                          }, d)
                                                        }
                                                        %}

implicitMult  -> primary                                {% id %}
implicitMult  -> implicitMult ref                       {% implicitMultHandler %}
implicitMult  -> implicitMult __ primary                {% implicitMultHandler %}


primary      -> functionCall                            {% id %}
primary      -> select                                  {% id %}

primary      -> literal                                 {% id %}
primary      -> ref                                     {% id %}

primary      -> parenthesizedExpression                 {% id %}

primary      -> "-" _ parenthesizedExpression           {% unaryMinusHandler %}
primary      -> "-" _ ref                               {% unaryMinusHandler %}

primary      -> ("!" | "not") _ expression              {%
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

primary     -> primary _ "^" _ int                      {%
                                                        (d) => {
                                                          const left = d[0]
                                                          const right = numberLiteralFromUnits(d, d[4].n)

                                                          return addArrayLoc({
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: ['^'],
                                                              },
                                                              addArrayLoc({
                                                                type: 'argument-list',
                                                                args: [left, right]
                                                              }, d)
                                                            ],
                                                          }, d)
                                                        }
                                                        %}

primary -> (ref | functionCall | parenthesizedExpression | select) _ "." _ %identifier {%
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
parenthesizedExpression -> "(" _ expression _ ")"       {%
                                                        (d) => addArrayLoc(d[2], d)
                                                        %}


#################
### Operators ###
#################

additiveOperator  -> ("-" | "+" | "&&" | "||" | "or" | "and")  {%
                                                        (d) => {
                                                          const op = d[0][0].value
                                                          return addArrayLoc({
                                                            name: op
                                                          }, d)
                                                        }
                                                        %}

multOp -> ("**" | ">" | "<" | "<=" | ">=" | "==" | "!=" | "contains" | " %") {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            name: d[0].map(t => t.value).join(''),
                                                          }, d[0])
                                                        }
                                                        %}

multOp -> __ "%"                                        {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            name: d[1].value,
                                                          }, d)
                                                        }
                                                        %}

multOp -> ("*" | "/")                                   {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            name: d[0][0].value
                                                          }, d)
                                                        }
                                                        %}
