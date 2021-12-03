@lexer tokenizer

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
asExp         -> asExp _ ("as" | "to" | "in") _ units   {%
                                                        (d, _l, reject) => {
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

addSubOp     -> primary                                 {% id %}
addSubOp     -> addSubOp _ multiplicativeOperator _ primary {%
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

ref          -> identifier                              {%
                                                        (d, _l, reject) => {
                                                          const name = d[0].name
                                                          if (reservedWords.has(name)) {
                                                            return reject
                                                          } else {
                                                            return addLoc({ type: 'ref', args: [ name ] }, d[0])
                                                          }
                                                        }
                                                        %}

primary      -> functionCall                            {% id %}
primary      -> select                                  {% id %}

primary      -> literal                                 {% id %}
primary      -> ref                                     {% id %}

primary      -> parenthesizedExpression                 {% id %}

primary      -> "-" _ expression                        {%
                                                        (d) => {
                                                          const expr = d[2]
                                                          if (
                                                            expr.type === 'literal' &&
                                                            expr.args[0] === 'number'
                                                          ) {
                                                            expr.args[1] = -expr.args[1]
                                                            expr.args[3] = expr.args[3] ? expr.args[3].neg() : expr.args[3]
                                                            return addArrayLoc({
                                                              type: expr.type,
                                                              args: expr.args,
                                                            }, d)
                                                          } else {
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
                                                          }
                                                        }
                                                        %}

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

primary      -> (ref | functionCall | parenthesizedExpression | select) _ "." _ %identifier {%
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

multiplicativeOperator -> ("**" | ">" | "<" | "<=" | ">=" | "==" | "!=" | "contains") {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            name: d[0].map(t => t.value).join(''),
                                                          }, d[0])
                                                        }
                                                        %}

multiplicativeOperator -> " " ("*" | "/" | "%" | "^") " " {%
                                                        (d) => {
                                                          return addArrayLoc({
                                                            name: d[1][0].value
                                                          }, d)
                                                        }
                                                        %}
