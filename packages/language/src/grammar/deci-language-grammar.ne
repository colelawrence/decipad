@{%

const knownUnits = require('./units').knownUnits

const reservedWords = new Set([
  '\n',
  'in',
  'where',
  'per',
  'true',
  'false',
  'if',
  'then',
  'else',
  '+',
  '-',
  '*',
  '/',
  '^',
  '**'
])

function isReservedWord(str) {
  return reservedWords.has(str)
}

function lengthOf(d) {
  return d.reduce((acc, c) => acc + ((c && c.length) || 0), 0)
}

%}

block         -> _ statement                            {%
                                                        (d, l) => {
                                                          const stmt = d[1]
                                                          return {
                                                            type: 'block',
                                                            args: [stmt],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}
block         -> statement "\n" block                   {%
                                                        (d, l) => {
                                                          const stmt = d[0]
                                                          return {
                                                            type: 'block',
                                                            args: [stmt, ...d[2].args],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

statement     -> refAssignment                          {%
                                                        (d, l) => {
                                                          const stmt = d[0]
                                                          return {
                                                            ...stmt,
                                                            location: l,
                                                            length: stmt.length
                                                          }
                                                        }
                                                        %}
statement     -> functionDef                            {%
                                                        (d, l) => {
                                                          const stmt = d[0]
                                                          return {
                                                            ...stmt,
                                                            location: l,
                                                            length: stmt.length
                                                          }
                                                        }
                                                        %}
statement     -> expression                             {%
                                                        (d, l) => {
                                                          const stmt = d[0]
                                                          return {
                                                            ...stmt,
                                                            location: l,
                                                            length: stmt.length
                                                          }
                                                        }
                                                        %}

##################
### References ###
##################

refAssignment -> referenceName _ "=" _ expression       {%
                                                        (d, l) => (
                                                          {
                                                            type: 'assign',
                                                            args: [
                                                              {
                                                                type: 'def',
                                                                args: [d[0].name],
                                                                location: l,
                                                                length: d[0].length
                                                              },
                                                              d[4]
                                                            ],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        )
                                                        %}

referenceName -> ([a-zA-Z\$] [a-zA-Z0-9]:*) (" " [a-zA-Z0-9]:+):* {%
                                                        (d, l, reject) => {
                                                          const first = d[0][0] + d[0][1].join('')
                                                          const rest = d[1].map((e) => e[0] + e[1].join('')).join('')
                                                          const r =  first + rest
                                                          for (word of r.split(' ')) {
                                                            if (reservedWords.has(word.trim())) {
                                                              return reject
                                                            }
                                                          }

                                                          return {
                                                            name: r,
                                                            location: l,
                                                            length: r.length
                                                          }
                                                        }
                                                        %}

referenceInExpression -> [a-zA-Z\$] [a-zA-Z0-9]:*       {%
                                                        (d, l, reject) => {
                                                          const r = d[0] + d[1].join('')
                                                          for (word of r.split(' ')) {
                                                            if (reservedWords.has(word.trim())) {
                                                              return reject
                                                            }
                                                          }
                                                          return {
                                                            name: r,
                                                            location: l,
                                                            length: r.length
                                                          }
                                                        }
                                                        %}

referenceInExpression -> "`" referenceName "`"          {%
                                                        (d, l) => {
                                                          return {
                                                            name: d[1].name,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

referenceAsOperator -> "`" referenceName "`"            {%
                                                        (d, l) => {
                                                          return {
                                                            name: d[1].name,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}


###########################
### Function definition ###
###########################

functionDef -> functionDefName _ "=" _ functionDefArgs _ "=>" block {%
                                                        (d, l) => ({
                                                          type: "function-definition",
                                                          args: [
                                                            {
                                                              type: "funcdef",
                                                              args: [d[0]],
                                                              location: l,
                                                              length: d[0].length
                                                            },
                                                            d[4],
                                                            d[7]
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

functionDefName -> simpleFunctionDefName                {% id %}
functionDefName -> complexFunctionDefName               {% id %}

simpleFunctionDefName -> [a-z] [0-9a-zA-Z]:*            {%
                                                        (d, l, reject) => {
                                                          const name = d[0] + d[1].join('')
                                                          if (reservedWords.has(name)) {
                                                            return reject
                                                          }

                                                          return name
                                                        }
                                                        %}

complexFunctionDefSurname -> " " [0-9a-zA-Z]:+          {% d => d[0] + d[1].join('') %}
complexFunctionDefName -> simpleFunctionDefName complexFunctionDefSurname:+ {% d => d.join('') %}

functionDefArgs  -> argName                             {%
                                                        (d, l) => ({
                                                          type: 'argument-names',
                                                          args: [d[0]],
                                                          location: l,
                                                          length: d[0].length
                                                        })
                                                        %}

functionDefArgs  -> argName ___ functionDefArgs         {%
                                                        (d, l) => ({
                                                          type: 'argument-names',
                                                          args: [
                                                            d[0]
                                                          ].concat(d[2].args),
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

argName -> [a-zA-Z] [0-9a-zA-Z]:*                       {%
                                                        (d, l) => ({
                                                          type: 'def',
                                                          args: [d[0] + d[1].join('')],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}


##################
### Expression ###
##################

expression   -> term                                    {% id %}

expression   -> term _ dissociativeOperator _ expression {%
                                                        (d, l) => ({
                                                          type: 'function-call',
                                                          args: [
                                                            {
                                                              type: 'funcref',
                                                              args: [d[2].name],
                                                              location: l + lengthOf([d[0], d[1]]),
                                                              length: d[2].length
                                                            },
                                                            {
                                                              type: 'argument-list',
                                                              args: [d[0], d[4]],
                                                              location: l,
                                                              length: lengthOf(d)
                                                            }
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

term         -> factor                                  {% id %}
term         -> factor _ associativeOperator _ term     {%
                                                        (d, l) => ({
                                                          type: 'function-call',
                                                          args: [
                                                            {
                                                              type: 'funcref',
                                                              args: [d[2].name],
                                                              location: l + lengthOf([d[0], d[1]]),
                                                              length: d[2].length
                                                            },
                                                            {
                                                              type: 'argument-list',
                                                              args: [d[0], d[4]],
                                                              location: l,
                                                              length: lengthOf(d)
                                                            }
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

factor       -> literal                                 {% id %}
factor       -> referenceInExpression                   {%
                                                        (d, l, reject) => {
                                                          const name = d[0]
                                                          if (reservedWords.has(name.name)) {
                                                            return reject
                                                          }
                                                          return {
                                                            type: 'ref',
                                                            args: [ name.name ],
                                                            location: l,
                                                            length: name.length
                                                          }
                                                        }
                                                        %}

factor       -> "(" _ expression _ ")"                  {%
                                                        (d, l) => {
                                                          return {
                                                            ...d[2],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

factor       -> "-" _ expression                        {%
                                                        (d, l, reject) => {
                                                          const expr = d[2]
                                                          if (expr.type === 'literal' && expr.args[0] === 'number') {
                                                            return reject
                                                          }

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [d[0]],
                                                                location: l,
                                                                length: 1
                                                              },
                                                              {
                                                                type: 'argument-list',
                                                                args: [d[2]],
                                                                location: lengthOf([d[0], d[1]]),
                                                                length: d[2].length
                                                              }
                                                            ],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

expression   -> conditional                             {% id %}
expression   -> functionCall                            {% id %}


################
### Operator ###
################

dissociativeOperator  -> ("+" | "-" | "&&" | "||") {%
                                                        (d, l) => {
                                                          const op = d[0][0]
                                                          return {
                                                            name: op,
                                                            location: l,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}

dissociativeOperator  -> __ ("in") __    {%
                                                        (d, l) => {
                                                          return {
                                                            name: d[1],
                                                            location: l + d[0].length,
                                                            length: d[1].length
                                                          }
                                                        }
                                                        %}
dissociativeOperator  -> referenceAsOperator            {% id %}


associativeOperator -> ("**" | "%" | ">" | "<" | "<=" | ">=" | "==")       {%
                                                        (d, l) => {
                                                          const op = d[0][0]
                                                          return {
                                                            name: op,
                                                            location: l,
                                                            length: op.length
                                                          }
                                                        }
                                                        %}
associativeOperator -> (" * " | " / ")                  {%
                                                        (d, l) => {
                                                          const op = d[0][0].trim()
                                                          return {
                                                            name: op,
                                                            location: l + 1,
                                                            length: 1
                                                          }
                                                        }
                                                        %}


#####################
### Function call ###
#####################

functionCall -> functionNameRef ___ funcArgumentList    {%
                                                        (d, l) => {
                                                          const func = d[0]
                                                          const args = d[2]

                                                          return {
                                                            type: 'function-call',
                                                            args: [
                                                              {
                                                                type: 'funcref',
                                                                args: [func.name],
                                                                location: func.location,
                                                                length: func.length
                                                              },
                                                              {
                                                                type: 'argument-list',
                                                                args: args.args,
                                                                location: args.location,
                                                                length: args.length
                                                              }
                                                            ],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

functionNameRef -> simpleFunctionNameRef                {% id %}
functionNameRef -> "`" complexFunctionNameRef "`"       {% d => d[1] %}
functionNameRefWord -> [a-zAZ] [0-9a-zA-Z]:*            {%
                                                        (d, l, reject) => {
                                                          const candidate = d[0] + d[1].join('')
                                                          if (isReservedWord(candidate)) {
                                                            return reject
                                                          }
                                                          return {
                                                            name: candidate,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}
simpleFunctionNameRef -> functionNameRefWord            {% id %}
complexFunctionNameRef -> functionNameRefWord " " complexFunctionNameRef {%
                                                        (d, l) => {
                                                          const part1 = d[0]
                                                          const part2 = d[2]
                                                          return {
                                                            name: part1.name + " " + part2.name,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

funcArgumentList -> expression                          {%
                                                        (d, l) => {
                                                          const e = d[0]
                                                          return {
                                                            args: [e],
                                                            location: l,
                                                            length: e.length
                                                          }
                                                        }
                                                        %}

funcArgumentList -> expression ___ funcArgumentList      {%
                                                        (d, l) => {
                                                          const e = d[0]
                                                          const args = d[2]
                                                          return {
                                                            args: [e, ...args.args],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}


###################
### Conditional ###
###################

conditional  -> "if" __ expression __ "then" __ expression __ "else" __ expression {%
                                                        (d, l) => ({
                                                          type: "conditional",
                                                          args: [
                                                            d[2],
                                                            d[6],
                                                            d[10]
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

##############
### Column ###
##############

column       -> "[" _ "]"                               {%
                                                        (d, l) => ({
                                                          type: 'column',
                                                          args: [
                                                            []
                                                          ],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
column       -> "[" _ expression (_ "," _ expression):* _ "]" {%
                                                        (d, l) => {

                                                         const exp1 = d[2]
                                                         const elems = [exp1]
                                                         let length  = lengthOf([d[0], d[1], d[2]])

                                                         for (const e of d[3]) {
                                                           const [s1, c, s2, expr] = e
                                                           elems.push(expr)
                                                           length += lengthOf(e)
                                                         }

                                                         return {
                                                           type: 'column',
                                                           args: [
                                                             elems
                                                           ],
                                                           location: l,
                                                           length
                                                         }
                                                        }
                                                        %}


#############
### Table ###
#############

table        -> "{" tableColDef "}"                     {%
                                                        (d, l) => ({
                                                          type: 'table',
                                                          args: d[1].coldefs,
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

tableColDef -> _                                        {%
                                                        (d, l) => ({
                                                          coldefs: [],
                                                          location: l,
                                                          length: d[0].length
                                                        })
                                                        %}

tableColDef -> _ tableOneColDef (tableDefSeparator tableOneColDef):* _ {%
                                                        (d, l) => {
                                                          const initial = {
                                                            coldefs: d[1].coldefs,
                                                            location: l,
                                                            length: lengthOf([d[0], d[1], d[3]])
                                                          }

                                                          return d[2].reduce((coldefs, more) => {
                                                            const [_, oneColDef] = more
                                                            return {
                                                              coldefs: [
                                                                ...coldefs.coldefs,
                                                                ...oneColDef.coldefs
                                                              ],
                                                              location: l,
                                                              length: coldefs.length + lengthOf(more)
                                                            }
                                                          }, initial)
                                                        }
                                                        %}

tableOneColDef -> referenceName                         {%
                                                        (d, l) => {
                                                          const ref = d[0]
                                                          return {
                                                            coldefs: [
                                                              {
                                                                type: 'coldef',
                                                                args: [ref.name],
                                                                location: l,
                                                                length: ref.length
                                                              },
                                                              {
                                                                type: 'ref',
                                                                args: [ ref.name ],
                                                                location: l,
                                                                length: ref.length
                                                              }
                                                            ],
                                                            location: l,
                                                            length: ref.length
                                                          }
                                                        }
                                                        %}

tableOneColDef -> referenceName _ "=" _ expression      {%
                                                        (d, l) => {
                                                          const ref = d[0]
                                                          return {
                                                            coldefs: [
                                                              {
                                                                type: 'coldef',
                                                                args: [ref.name],
                                                                location: l,
                                                                length: ref.length
                                                              },
                                                              d[4]
                                                            ],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

tableDefSeparator -> _ "\n" _                           {%
                                                        (d, l) => ({
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
tableDefSeparator -> _ "," _                            {%
                                                        (d, l) => ({
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

###############
### Literal ###
###############

literal     -> boolean                                  {% id %}
literal     -> character                                {% id %}
literal     -> string                                   {% id %}
literal     -> number                                   {% id %}
literal     -> column                                   {% id %}
literal     -> table                                    {% id %}

boolean     -> "true"                                   {%
                                                        (d, l) => ({
                                                          type: 'literal',
                                                          args: ['boolean', true],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}
boolean     -> "false"                                  {%
                                                        (d, l) => ({
                                                          type: 'literal',
                                                          args: ['boolean', false],
                                                          location: l,
                                                          length: lengthOf(d)
                                                        })
                                                        %}

character   -> "'"  sstrchar "'"                        {%
                                                        (d, l) => {
                                                          const c = d[0]
                                                          return {
                                                            type: 'literal',
                                                            args: ['char', d[1]],
                                                            location: l,
                                                            length: 2 + c.length
                                                          }
                                                        }
                                                        %}

string      -> dqstring                                 {%
                                                        (d, l) => {
                                                          const s = d[0]
                                                          return {
                                                            type: 'literal',
                                                            args: ['string', s],
                                                            location: l,
                                                            length: 2 + s.length
                                                          }
                                                        }
                                                        %}

number       -> plainNumber                             {%
                                                        (d, l) => {
                                                          const n = d[0]
                                                          return {
                                                            type: 'literal',
                                                            args: ['number', n.n, null],
                                                            location: l,
                                                            length: n.length
                                                          }
                                                        }
                                                        %}
number      -> plainNumber _ units                      {%
                                                        (d, l) => {
                                                          const n = d[0]
                                                          const units = d[2]
                                                          return {
                                                            type: 'literal',
                                                            args: ['number', n.n, d[2].units],
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

plainNumber -> percentage                               {% id %}
plainNumber -> jsonfloat                                {% id %}

units -> unit                                           {%
                                                        (d, l) => {
                                                          const u = d[0]
                                                          return {
                                                            units: [u],
                                                            location: l,
                                                            length: u.length
                                                          }
                                                        }
                                                        %}

units -> unit ( "." | "*" ) units                       {%
                                                        (d, l) => {
                                                          return {
                                                            units: [d[0], ...d[2].units],
                                                            location: l,
                                                            length: lengthOf([d[0], d[1][0], d[2]])
                                                          }
                                                        }
                                                        %}

units -> unit ("/" | __ "per" __) units                 {%
                                                        (d, l) => {
                                                          let [second, ...rest] = d[2].units
                                                          second = {
                                                            unit: second.unit,
                                                            exp: -second.exp,
                                                            multiplier: second.multiplier,
                                                            known: second.known,
                                                            location: second.location,
                                                            length: second.length
                                                          }
                                                          return {
                                                            units: [d[0], second, ...rest],
                                                            location: l,
                                                            length: lengthOf([d[0], d[1][0], d[2]])
                                                          }
                                                        }
                                                        %}

unit -> simpleunit                                      {% id %}

simpleunit -> multiplierprefix knownUnitName            {%
                                                        (d, l) => {
                                                          const mult = d[0]
                                                          return {
                                                            unit: d[1],
                                                            exp: 1,
                                                            multiplier: mult.multiplier,
                                                            known: true,
                                                            location: l,
                                                            length: mult.length + d[1].length
                                                          }
                                                        }
                                                        %}

knownUnitName -> [°a-zA-Z]:+                            {%
                                                        (d, l, reject) => {
                                                          const candidate = d[0].join('')
                                                          if (!knownUnits.has(candidate)) {
                                                            return reject
                                                          }
                                                          return candidate
                                                        }
                                                        %}

simpleunit -> unknownUnitName                           {% id %}

unknownUnitName -> [yzafpnμmcdhkMGTPEZY] [a-zA-Z]:*     {%
                                                        (d, l, reject) => {
                                                          const rest = d[1].join('')
                                                          if (knownUnits.has(rest) || reservedWords.has(rest)) {
                                                            return reject
                                                          }
                                                          const all = d[0] + rest
                                                          if (knownUnits.has(all) || reservedWords.has(all)) {
                                                            return reject
                                                          }

                                                          return {
                                                            unit: all,
                                                            exp: 1,
                                                            multiplier: 1,
                                                            known: false,
                                                            location: l,
                                                            length: all.length
                                                          }
                                                        }
                                                        %}
unknownUnitName -> [^yzafpnμmcdhkMGTPEZY0-9=+\%*\- ] [a-zA-Z]:*    {%
                                                        (d, l, reject) => {
                                                          const candidate = d[0] + d[1].join('')
                                                          if (knownUnits.has(candidate) || reservedWords.has(candidate)) {
                                                            return reject
                                                          }

                                                          return {
                                                            unit: candidate,
                                                            exp: 1,
                                                            multiplier: 1,
                                                            known: false,
                                                            location: l,
                                                            length: candidate.length
                                                          }
                                                        }
                                                        %}

multiplierprefix -> null                                {% (d, l) => ({ multiplier: 1, location: l, length: 0 }) %}
multiplierprefix -> ("y" | "yocto")                     {% (d, l) => ({ multiplier: 1e-24, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("z" | "zepto")                     {% (d, l) => ({ multiplier: 1e-21, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("a" | "atto")                      {% (d, l) => ({ multiplier: 1e-18, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("f" | "femto")                     {% (d, l) => ({ multiplier: 1e-15, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("p" | "pico")                      {% (d, l) => ({ multiplier: 1e-12, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("n" | "nano")                      {% (d, l) => ({ multiplier: 1e-9, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("μ" | "micro")                     {% (d, l) => ({ multiplier: 1e-6, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("m" | "milli")                     {% (d, l) => ({ multiplier: 1e-3, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("c" | "centi")                     {% (d, l) => ({ multiplier: 1e-2, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("d" | "deci")                      {% (d, l) => ({ multiplier: 1e-1, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("da" | "deca")                     {% (d, l) => ({ multiplier: 1e1, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("h" | "hecto")                     {% (d, l) => ({ multiplier: 1e2, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("k" | "kilo")                      {% (d, l) => ({ multiplier: 1e3, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("M" | "mega")                      {% (d, l) => ({ multiplier: 1e6, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("G" | "giga")                      {% (d, l) => ({ multiplier: 1e9, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("T" | "tera")                      {% (d, l) => ({ multiplier: 1e12, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("P" | "peta")                      {% (d, l) => ({ multiplier: 1e15, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("E" | "exa")                       {% (d, l) => ({ multiplier: 1e18, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("Z" | "zetta")                     {% (d, l) => ({ multiplier: 1e21, location: l, length: d[0][0].length}) %}
multiplierprefix -> ("Y" | "yotta")                     {% (d, l) => ({ multiplier: 1e24, location: l, length: d[0][0].length}) %}

unit -> simpleunit "^" int                              {%
                                                        (d, l) => {
                                                          const u = d[0]
                                                          const n = d[2]
                                                          return Object.assign(d[0], {
                                                            exp: u.exp * n.n,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          })
                                                        }
                                                        %}

##############
### Number ###
##############


int -> ("-"|"+"):? [0-9]:+                              {%
                                                        (d, l) => {
                                                          let n
                                                          if (d[0]) {
                                                              n = parseInt(d[0][0]+d[1].join(""));
                                                          } else {
                                                              n = parseInt(d[1].join(""));
                                                          }

                                                          return {
                                                            n,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}


jsonfloat -> "-":? [0-9]:+ ("." [0-9]:+):? ([eE] [+-]:? [0-9]:+):? {%
                                                        (d, l) => {
                                                          const n = parseFloat(
                                                            (d[0] || "") +
                                                            d[1].join("") +
                                                            (d[2] ? "."+d[2][1].join("") : "") +
                                                            (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : ""))

                                                          return {
                                                            n,
                                                            location: l,
                                                            length: lengthOf([d[0], d[1], d[2] && d[2][0], d[2] && d[2][1], d[3] && d[3][0], d[3] && d[3][1], d[3] && d[3][2]])
                                                          }
                                                        }
                                                        %}

decimal -> "-":? [0-9]:+ ("." [0-9]:+):?                {%
                                                        (d, l) => {
                                                          const n = parseFloat(
                                                            (d[0] || "") +
                                                            d[1].join("") +
                                                            (d[2] ? "."+d[2][1].join("") : ""))

                                                          return {
                                                            n,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

percentage -> decimal "%"                               {%
                                                        (d, l) => {
                                                          return {
                                                            n: d[0] / 1000,
                                                            location: l,
                                                            length: lengthOf(d)
                                                          }
                                                        }
                                                        %}

##############
### String ###
##############


# Double-quoted string
dqstring -> "\"" dstrchar:* "\"" {% (d) => d[1].join("") %}

dstrchar -> [^\\"\n] {% id %}
    | "\\" strescape {%
    (d) => JSON.parse("\""+d.join("")+"\"")
%}

sstrchar -> [^\\'\n] {% id %}
    | "\\" strescape
        {% (d) => JSON.parse("\""+d.join("")+"\"") %}
    | "\\'"
        {% (d) => "'" %}

strescape -> ["\\/bfnrt] {% id %}
    | "u" [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] {%
    (d) => d.join("")
%}


###################
### White space ###
###################

_  -> wschar:* {% id %}
__ -> wschar:+ {% id %}
___ -> [ \t]:+ {% id %}

wschar -> [ \t\n\v\f] {% id %}