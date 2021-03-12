// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


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

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "block", "symbols": ["_", "statement"], "postprocess": 
        (d, l) => {
          const stmt = d[1]
          return {
            type: 'block',
            args: [stmt],
            location: l,
            length: lengthOf(d)
          }
        }
        },
    {"name": "block", "symbols": ["statement", {"literal":"\n"}, "block"], "postprocess": 
        (d, l) => {
          const stmt = d[0]
          return {
            type: 'block',
            args: [stmt, ...d[2].args],
            location: l,
            length: lengthOf(d)
          }
        }
        },
    {"name": "statement", "symbols": ["refAssignment"], "postprocess": 
        (d, l) => {
          const stmt = d[0]
          return {
            ...stmt,
            location: l,
            length: stmt.length
          }
        }
        },
    {"name": "statement", "symbols": ["functionDef"], "postprocess": 
        (d, l) => {
          const stmt = d[0]
          return {
            ...stmt,
            location: l,
            length: stmt.length
          }
        }
        },
    {"name": "statement", "symbols": ["expression"], "postprocess": 
        (d, l) => {
          const stmt = d[0]
          return {
            ...stmt,
            location: l,
            length: stmt.length
          }
        }
        },
    {"name": "refAssignment", "symbols": ["referenceName", "_", {"literal":"="}, "_", "expression"], "postprocess": 
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
        },
    {"name": "referenceName$subexpression$1$ebnf$1", "symbols": []},
    {"name": "referenceName$subexpression$1$ebnf$1", "symbols": ["referenceName$subexpression$1$ebnf$1", /[a-zA-Z0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "referenceName$subexpression$1", "symbols": [/[a-zA-Z\$]/, "referenceName$subexpression$1$ebnf$1"]},
    {"name": "referenceName$ebnf$1", "symbols": []},
    {"name": "referenceName$ebnf$1$subexpression$1$ebnf$1", "symbols": [/[a-zA-Z0-9]/]},
    {"name": "referenceName$ebnf$1$subexpression$1$ebnf$1", "symbols": ["referenceName$ebnf$1$subexpression$1$ebnf$1", /[a-zA-Z0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "referenceName$ebnf$1$subexpression$1", "symbols": [{"literal":" "}, "referenceName$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "referenceName$ebnf$1", "symbols": ["referenceName$ebnf$1", "referenceName$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "referenceName", "symbols": ["referenceName$subexpression$1", "referenceName$ebnf$1"], "postprocess": 
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
        },
    {"name": "referenceInExpression$ebnf$1", "symbols": []},
    {"name": "referenceInExpression$ebnf$1", "symbols": ["referenceInExpression$ebnf$1", /[a-zA-Z0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "referenceInExpression", "symbols": [/[a-zA-Z\$]/, "referenceInExpression$ebnf$1"], "postprocess": 
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
        },
    {"name": "referenceInExpression", "symbols": [{"literal":"`"}, "referenceName", {"literal":"`"}], "postprocess": 
        (d, l) => {
          return {
            name: d[1].name,
            location: l,
            length: lengthOf(d)
          }
        }
        },
    {"name": "referenceAsOperator", "symbols": [{"literal":"`"}, "referenceName", {"literal":"`"}], "postprocess": 
        (d, l) => {
          return {
            name: d[1].name,
            location: l,
            length: lengthOf(d)
          }
        }
        },
    {"name": "functionDef$string$1", "symbols": [{"literal":"="}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "functionDef", "symbols": ["functionDefName", "_", {"literal":"="}, "_", "functionDefArgs", "_", "functionDef$string$1", "block"], "postprocess": 
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
        },
    {"name": "functionDefName", "symbols": ["simpleFunctionDefName"], "postprocess": id},
    {"name": "functionDefName", "symbols": ["complexFunctionDefName"], "postprocess": id},
    {"name": "simpleFunctionDefName$ebnf$1", "symbols": []},
    {"name": "simpleFunctionDefName$ebnf$1", "symbols": ["simpleFunctionDefName$ebnf$1", /[0-9a-zA-Z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "simpleFunctionDefName", "symbols": [/[a-z]/, "simpleFunctionDefName$ebnf$1"], "postprocess": 
        (d, l, reject) => {
          const name = d[0] + d[1].join('')
          if (reservedWords.has(name)) {
            return reject
          }
        
          return name
        }
        },
    {"name": "complexFunctionDefSurname$ebnf$1", "symbols": [/[0-9a-zA-Z]/]},
    {"name": "complexFunctionDefSurname$ebnf$1", "symbols": ["complexFunctionDefSurname$ebnf$1", /[0-9a-zA-Z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "complexFunctionDefSurname", "symbols": [{"literal":" "}, "complexFunctionDefSurname$ebnf$1"], "postprocess": d => d[0] + d[1].join('')},
    {"name": "complexFunctionDefName$ebnf$1", "symbols": ["complexFunctionDefSurname"]},
    {"name": "complexFunctionDefName$ebnf$1", "symbols": ["complexFunctionDefName$ebnf$1", "complexFunctionDefSurname"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "complexFunctionDefName", "symbols": ["simpleFunctionDefName", "complexFunctionDefName$ebnf$1"], "postprocess": d => d.join('')},
    {"name": "functionDefArgs", "symbols": ["argName"], "postprocess": 
        (d, l) => ({
          type: 'argument-names',
          args: [d[0]],
          location: l,
          length: d[0].length
        })
        },
    {"name": "functionDefArgs", "symbols": ["argName", "___", "functionDefArgs"], "postprocess": 
        (d, l) => ({
          type: 'argument-names',
          args: [
            d[0]
          ].concat(d[2].args),
          location: l,
          length: lengthOf(d)
        })
        },
    {"name": "argName$ebnf$1", "symbols": []},
    {"name": "argName$ebnf$1", "symbols": ["argName$ebnf$1", /[0-9a-zA-Z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "argName", "symbols": [/[a-zA-Z]/, "argName$ebnf$1"], "postprocess": 
        (d, l) => ({
          type: 'def',
          args: [d[0] + d[1].join('')],
          location: l,
          length: lengthOf(d)
        })
        },
    {"name": "expression", "symbols": ["term"], "postprocess": id},
    {"name": "expression", "symbols": ["term", "_", "dissociativeOperator", "_", "expression"], "postprocess": 
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
        },
    {"name": "term", "symbols": ["factor"], "postprocess": id},
    {"name": "term", "symbols": ["factor", "_", "associativeOperator", "_", "term"], "postprocess": 
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
        },
    {"name": "factor", "symbols": ["literal"], "postprocess": id},
    {"name": "factor", "symbols": ["referenceInExpression"], "postprocess": 
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
        },
    {"name": "factor", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": 
        (d, l) => {
          return {
            ...d[2],
            location: l,
            length: lengthOf(d)
          }
        }
        },
    {"name": "factor", "symbols": [{"literal":"-"}, "_", "expression"], "postprocess": 
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
        },
    {"name": "expression", "symbols": ["conditional"], "postprocess": id},
    {"name": "expression", "symbols": ["functionCall"], "postprocess": id},
    {"name": "dissociativeOperator$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "dissociativeOperator$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "dissociativeOperator$subexpression$1$string$1", "symbols": [{"literal":"&"}, {"literal":"&"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "dissociativeOperator$subexpression$1", "symbols": ["dissociativeOperator$subexpression$1$string$1"]},
    {"name": "dissociativeOperator$subexpression$1$string$2", "symbols": [{"literal":"|"}, {"literal":"|"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "dissociativeOperator$subexpression$1", "symbols": ["dissociativeOperator$subexpression$1$string$2"]},
    {"name": "dissociativeOperator", "symbols": ["dissociativeOperator$subexpression$1"], "postprocess": 
        (d, l) => {
          const op = d[0][0]
          return {
            name: op,
            location: l,
            length: op.length
          }
        }
        },
    {"name": "dissociativeOperator$subexpression$2$string$1", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "dissociativeOperator$subexpression$2", "symbols": ["dissociativeOperator$subexpression$2$string$1"]},
    {"name": "dissociativeOperator", "symbols": ["__", "dissociativeOperator$subexpression$2", "__"], "postprocess": 
        (d, l) => {
          return {
            name: d[1],
            location: l + d[0].length,
            length: d[1].length
          }
        }
        },
    {"name": "dissociativeOperator", "symbols": ["referenceAsOperator"], "postprocess": id},
    {"name": "associativeOperator$subexpression$1$string$1", "symbols": [{"literal":"*"}, {"literal":"*"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "associativeOperator$subexpression$1", "symbols": ["associativeOperator$subexpression$1$string$1"]},
    {"name": "associativeOperator$subexpression$1", "symbols": [{"literal":"%"}]},
    {"name": "associativeOperator$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "associativeOperator$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "associativeOperator$subexpression$1$string$2", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "associativeOperator$subexpression$1", "symbols": ["associativeOperator$subexpression$1$string$2"]},
    {"name": "associativeOperator$subexpression$1$string$3", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "associativeOperator$subexpression$1", "symbols": ["associativeOperator$subexpression$1$string$3"]},
    {"name": "associativeOperator$subexpression$1$string$4", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "associativeOperator$subexpression$1", "symbols": ["associativeOperator$subexpression$1$string$4"]},
    {"name": "associativeOperator", "symbols": ["associativeOperator$subexpression$1"], "postprocess": 
        (d, l) => {
          const op = d[0][0]
          return {
            name: op,
            location: l,
            length: op.length
          }
        }
        },
    {"name": "associativeOperator$subexpression$2$string$1", "symbols": [{"literal":" "}, {"literal":"*"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "associativeOperator$subexpression$2", "symbols": ["associativeOperator$subexpression$2$string$1"]},
    {"name": "associativeOperator$subexpression$2$string$2", "symbols": [{"literal":" "}, {"literal":"/"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "associativeOperator$subexpression$2", "symbols": ["associativeOperator$subexpression$2$string$2"]},
    {"name": "associativeOperator", "symbols": ["associativeOperator$subexpression$2"], "postprocess": 
        (d, l) => {
          const op = d[0][0].trim()
          return {
            name: op,
            location: l + 1,
            length: 1
          }
        }
        },
    {"name": "functionCall", "symbols": ["functionNameRef", "___", "funcArgumentList"], "postprocess": 
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
        },
    {"name": "functionNameRef", "symbols": ["simpleFunctionNameRef"], "postprocess": id},
    {"name": "functionNameRef", "symbols": [{"literal":"`"}, "complexFunctionNameRef", {"literal":"`"}], "postprocess": d => d[1]},
    {"name": "functionNameRefWord$ebnf$1", "symbols": []},
    {"name": "functionNameRefWord$ebnf$1", "symbols": ["functionNameRefWord$ebnf$1", /[0-9a-zA-Z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "functionNameRefWord", "symbols": [/[a-zAZ]/, "functionNameRefWord$ebnf$1"], "postprocess": 
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
        },
    {"name": "simpleFunctionNameRef", "symbols": ["functionNameRefWord"], "postprocess": id},
    {"name": "complexFunctionNameRef", "symbols": ["functionNameRefWord", {"literal":" "}, "complexFunctionNameRef"], "postprocess": 
        (d, l) => {
          const part1 = d[0]
          const part2 = d[2]
          return {
            name: part1.name + " " + part2.name,
            location: l,
            length: lengthOf(d)
          }
        }
        },
    {"name": "funcArgumentList", "symbols": ["expression"], "postprocess": 
        (d, l) => {
          const e = d[0]
          return {
            args: [e],
            location: l,
            length: e.length
          }
        }
        },
    {"name": "funcArgumentList", "symbols": ["expression", "___", "funcArgumentList"], "postprocess": 
        (d, l) => {
          const e = d[0]
          const args = d[2]
          return {
            args: [e, ...args.args],
            location: l,
            length: lengthOf(d)
          }
        }
        },
    {"name": "conditional$string$1", "symbols": [{"literal":"i"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "conditional$string$2", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "conditional$string$3", "symbols": [{"literal":"e"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "conditional", "symbols": ["conditional$string$1", "__", "expression", "__", "conditional$string$2", "__", "expression", "__", "conditional$string$3", "__", "expression"], "postprocess": 
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
        },
    {"name": "column", "symbols": [{"literal":"["}, "_", {"literal":"]"}], "postprocess": 
        (d, l) => ({
          type: 'column',
          args: [
            []
          ],
          location: l,
          length: lengthOf(d)
        })
        },
    {"name": "column$ebnf$1", "symbols": []},
    {"name": "column$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "expression"]},
    {"name": "column$ebnf$1", "symbols": ["column$ebnf$1", "column$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "column", "symbols": [{"literal":"["}, "_", "expression", "column$ebnf$1", "_", {"literal":"]"}], "postprocess": 
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
        },
    {"name": "table", "symbols": [{"literal":"{"}, "tableColDef", {"literal":"}"}], "postprocess": 
        (d, l) => ({
          type: 'table',
          args: d[1].coldefs,
          location: l,
          length: lengthOf(d)
        })
        },
    {"name": "tableColDef", "symbols": ["_"], "postprocess": 
        (d, l) => ({
          coldefs: [],
          location: l,
          length: d[0].length
        })
        },
    {"name": "tableColDef$ebnf$1", "symbols": []},
    {"name": "tableColDef$ebnf$1$subexpression$1", "symbols": ["tableDefSeparator", "tableOneColDef"]},
    {"name": "tableColDef$ebnf$1", "symbols": ["tableColDef$ebnf$1", "tableColDef$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "tableColDef", "symbols": ["_", "tableOneColDef", "tableColDef$ebnf$1", "_"], "postprocess": 
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
        },
    {"name": "tableOneColDef", "symbols": ["referenceName"], "postprocess": 
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
        },
    {"name": "tableOneColDef", "symbols": ["referenceName", "_", {"literal":"="}, "_", "expression"], "postprocess": 
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
        },
    {"name": "tableDefSeparator", "symbols": ["_", {"literal":"\n"}, "_"], "postprocess": 
        (d, l) => ({
          location: l,
          length: lengthOf(d)
        })
        },
    {"name": "tableDefSeparator", "symbols": ["_", {"literal":","}, "_"], "postprocess": 
        (d, l) => ({
          location: l,
          length: lengthOf(d)
        })
        },
    {"name": "literal", "symbols": ["boolean"], "postprocess": id},
    {"name": "literal", "symbols": ["character"], "postprocess": id},
    {"name": "literal", "symbols": ["string"], "postprocess": id},
    {"name": "literal", "symbols": ["number"], "postprocess": id},
    {"name": "literal", "symbols": ["column"], "postprocess": id},
    {"name": "literal", "symbols": ["table"], "postprocess": id},
    {"name": "boolean$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "boolean", "symbols": ["boolean$string$1"], "postprocess": 
        (d, l) => ({
          type: 'literal',
          args: ['boolean', true],
          location: l,
          length: lengthOf(d)
        })
        },
    {"name": "boolean$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "boolean", "symbols": ["boolean$string$2"], "postprocess": 
        (d, l) => ({
          type: 'literal',
          args: ['boolean', false],
          location: l,
          length: lengthOf(d)
        })
        },
    {"name": "character", "symbols": [{"literal":"'"}, "sstrchar", {"literal":"'"}], "postprocess": 
        (d, l) => {
          const c = d[0]
          return {
            type: 'literal',
            args: ['char', d[1]],
            location: l,
            length: 2 + c.length
          }
        }
        },
    {"name": "string", "symbols": ["dqstring"], "postprocess": 
        (d, l) => {
          const s = d[0]
          return {
            type: 'literal',
            args: ['string', s],
            location: l,
            length: 2 + s.length
          }
        }
        },
    {"name": "number", "symbols": ["plainNumber"], "postprocess": 
        (d, l) => {
          const n = d[0]
          return {
            type: 'literal',
            args: ['number', n.n, null],
            location: l,
            length: n.length
          }
        }
        },
    {"name": "number", "symbols": ["plainNumber", "_", "units"], "postprocess": 
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
        },
    {"name": "plainNumber", "symbols": ["percentage"], "postprocess": id},
    {"name": "plainNumber", "symbols": ["jsonfloat"], "postprocess": id},
    {"name": "units", "symbols": ["unit"], "postprocess": 
        (d, l) => {
          const u = d[0]
          return {
            units: [u],
            location: l,
            length: u.length
          }
        }
        },
    {"name": "units$subexpression$1", "symbols": [{"literal":"."}]},
    {"name": "units$subexpression$1", "symbols": [{"literal":"*"}]},
    {"name": "units", "symbols": ["unit", "units$subexpression$1", "units"], "postprocess": 
        (d, l) => {
          return {
            units: [d[0], ...d[2].units],
            location: l,
            length: lengthOf([d[0], d[1][0], d[2]])
          }
        }
        },
    {"name": "units$subexpression$2", "symbols": [{"literal":"/"}]},
    {"name": "units$subexpression$2$string$1", "symbols": [{"literal":"p"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "units$subexpression$2", "symbols": ["__", "units$subexpression$2$string$1", "__"]},
    {"name": "units", "symbols": ["unit", "units$subexpression$2", "units"], "postprocess": 
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
        },
    {"name": "unit", "symbols": ["simpleunit"], "postprocess": id},
    {"name": "simpleunit", "symbols": ["multiplierprefix", "knownUnitName"], "postprocess": 
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
        },
    {"name": "knownUnitName$ebnf$1", "symbols": [/[°a-zA-Z]/]},
    {"name": "knownUnitName$ebnf$1", "symbols": ["knownUnitName$ebnf$1", /[°a-zA-Z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "knownUnitName", "symbols": ["knownUnitName$ebnf$1"], "postprocess": 
        (d, l, reject) => {
          const candidate = d[0].join('')
          if (!knownUnits.has(candidate)) {
            return reject
          }
          return candidate
        }
        },
    {"name": "simpleunit", "symbols": ["unknownUnitName"], "postprocess": id},
    {"name": "unknownUnitName$ebnf$1", "symbols": []},
    {"name": "unknownUnitName$ebnf$1", "symbols": ["unknownUnitName$ebnf$1", /[a-zA-Z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unknownUnitName", "symbols": [/[yzafpnμmcdhkMGTPEZY]/, "unknownUnitName$ebnf$1"], "postprocess": 
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
        },
    {"name": "unknownUnitName$ebnf$2", "symbols": []},
    {"name": "unknownUnitName$ebnf$2", "symbols": ["unknownUnitName$ebnf$2", /[a-zA-Z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unknownUnitName", "symbols": [/[^yzafpnμmcdhkMGTPEZY0-9=+\%*\- ]/, "unknownUnitName$ebnf$2"], "postprocess": 
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
        },
    {"name": "multiplierprefix", "symbols": [], "postprocess": (d, l) => ({ multiplier: 1, location: l, length: 0 })},
    {"name": "multiplierprefix$subexpression$1", "symbols": [{"literal":"y"}]},
    {"name": "multiplierprefix$subexpression$1$string$1", "symbols": [{"literal":"y"}, {"literal":"o"}, {"literal":"c"}, {"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$1", "symbols": ["multiplierprefix$subexpression$1$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$1"], "postprocess": (d, l) => ({ multiplier: 1e-24, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$2", "symbols": [{"literal":"z"}]},
    {"name": "multiplierprefix$subexpression$2$string$1", "symbols": [{"literal":"z"}, {"literal":"e"}, {"literal":"p"}, {"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$2", "symbols": ["multiplierprefix$subexpression$2$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$2"], "postprocess": (d, l) => ({ multiplier: 1e-21, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$3", "symbols": [{"literal":"a"}]},
    {"name": "multiplierprefix$subexpression$3$string$1", "symbols": [{"literal":"a"}, {"literal":"t"}, {"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$3", "symbols": ["multiplierprefix$subexpression$3$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$3"], "postprocess": (d, l) => ({ multiplier: 1e-18, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$4", "symbols": [{"literal":"f"}]},
    {"name": "multiplierprefix$subexpression$4$string$1", "symbols": [{"literal":"f"}, {"literal":"e"}, {"literal":"m"}, {"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$4", "symbols": ["multiplierprefix$subexpression$4$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$4"], "postprocess": (d, l) => ({ multiplier: 1e-15, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$5", "symbols": [{"literal":"p"}]},
    {"name": "multiplierprefix$subexpression$5$string$1", "symbols": [{"literal":"p"}, {"literal":"i"}, {"literal":"c"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$5", "symbols": ["multiplierprefix$subexpression$5$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$5"], "postprocess": (d, l) => ({ multiplier: 1e-12, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$6", "symbols": [{"literal":"n"}]},
    {"name": "multiplierprefix$subexpression$6$string$1", "symbols": [{"literal":"n"}, {"literal":"a"}, {"literal":"n"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$6", "symbols": ["multiplierprefix$subexpression$6$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$6"], "postprocess": (d, l) => ({ multiplier: 1e-9, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$7", "symbols": [{"literal":"μ"}]},
    {"name": "multiplierprefix$subexpression$7$string$1", "symbols": [{"literal":"m"}, {"literal":"i"}, {"literal":"c"}, {"literal":"r"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$7", "symbols": ["multiplierprefix$subexpression$7$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$7"], "postprocess": (d, l) => ({ multiplier: 1e-6, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$8", "symbols": [{"literal":"m"}]},
    {"name": "multiplierprefix$subexpression$8$string$1", "symbols": [{"literal":"m"}, {"literal":"i"}, {"literal":"l"}, {"literal":"l"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$8", "symbols": ["multiplierprefix$subexpression$8$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$8"], "postprocess": (d, l) => ({ multiplier: 1e-3, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$9", "symbols": [{"literal":"c"}]},
    {"name": "multiplierprefix$subexpression$9$string$1", "symbols": [{"literal":"c"}, {"literal":"e"}, {"literal":"n"}, {"literal":"t"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$9", "symbols": ["multiplierprefix$subexpression$9$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$9"], "postprocess": (d, l) => ({ multiplier: 1e-2, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$10", "symbols": [{"literal":"d"}]},
    {"name": "multiplierprefix$subexpression$10$string$1", "symbols": [{"literal":"d"}, {"literal":"e"}, {"literal":"c"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$10", "symbols": ["multiplierprefix$subexpression$10$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$10"], "postprocess": (d, l) => ({ multiplier: 1e-1, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$11$string$1", "symbols": [{"literal":"d"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$11", "symbols": ["multiplierprefix$subexpression$11$string$1"]},
    {"name": "multiplierprefix$subexpression$11$string$2", "symbols": [{"literal":"d"}, {"literal":"e"}, {"literal":"c"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$11", "symbols": ["multiplierprefix$subexpression$11$string$2"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$11"], "postprocess": (d, l) => ({ multiplier: 1e1, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$12", "symbols": [{"literal":"h"}]},
    {"name": "multiplierprefix$subexpression$12$string$1", "symbols": [{"literal":"h"}, {"literal":"e"}, {"literal":"c"}, {"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$12", "symbols": ["multiplierprefix$subexpression$12$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$12"], "postprocess": (d, l) => ({ multiplier: 1e2, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$13", "symbols": [{"literal":"k"}]},
    {"name": "multiplierprefix$subexpression$13$string$1", "symbols": [{"literal":"k"}, {"literal":"i"}, {"literal":"l"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$13", "symbols": ["multiplierprefix$subexpression$13$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$13"], "postprocess": (d, l) => ({ multiplier: 1e3, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$14", "symbols": [{"literal":"M"}]},
    {"name": "multiplierprefix$subexpression$14$string$1", "symbols": [{"literal":"m"}, {"literal":"e"}, {"literal":"g"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$14", "symbols": ["multiplierprefix$subexpression$14$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$14"], "postprocess": (d, l) => ({ multiplier: 1e6, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$15", "symbols": [{"literal":"G"}]},
    {"name": "multiplierprefix$subexpression$15$string$1", "symbols": [{"literal":"g"}, {"literal":"i"}, {"literal":"g"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$15", "symbols": ["multiplierprefix$subexpression$15$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$15"], "postprocess": (d, l) => ({ multiplier: 1e9, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$16", "symbols": [{"literal":"T"}]},
    {"name": "multiplierprefix$subexpression$16$string$1", "symbols": [{"literal":"t"}, {"literal":"e"}, {"literal":"r"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$16", "symbols": ["multiplierprefix$subexpression$16$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$16"], "postprocess": (d, l) => ({ multiplier: 1e12, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$17", "symbols": [{"literal":"P"}]},
    {"name": "multiplierprefix$subexpression$17$string$1", "symbols": [{"literal":"p"}, {"literal":"e"}, {"literal":"t"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$17", "symbols": ["multiplierprefix$subexpression$17$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$17"], "postprocess": (d, l) => ({ multiplier: 1e15, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$18", "symbols": [{"literal":"E"}]},
    {"name": "multiplierprefix$subexpression$18$string$1", "symbols": [{"literal":"e"}, {"literal":"x"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$18", "symbols": ["multiplierprefix$subexpression$18$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$18"], "postprocess": (d, l) => ({ multiplier: 1e18, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$19", "symbols": [{"literal":"Z"}]},
    {"name": "multiplierprefix$subexpression$19$string$1", "symbols": [{"literal":"z"}, {"literal":"e"}, {"literal":"t"}, {"literal":"t"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$19", "symbols": ["multiplierprefix$subexpression$19$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$19"], "postprocess": (d, l) => ({ multiplier: 1e21, location: l, length: d[0][0].length})},
    {"name": "multiplierprefix$subexpression$20", "symbols": [{"literal":"Y"}]},
    {"name": "multiplierprefix$subexpression$20$string$1", "symbols": [{"literal":"y"}, {"literal":"o"}, {"literal":"t"}, {"literal":"t"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "multiplierprefix$subexpression$20", "symbols": ["multiplierprefix$subexpression$20$string$1"]},
    {"name": "multiplierprefix", "symbols": ["multiplierprefix$subexpression$20"], "postprocess": (d, l) => ({ multiplier: 1e24, location: l, length: d[0][0].length})},
    {"name": "unit", "symbols": ["simpleunit", {"literal":"^"}, "int"], "postprocess": 
        (d, l) => {
          const u = d[0]
          const n = d[2]
          return Object.assign(d[0], {
            exp: u.exp * n.n,
            location: l,
            length: lengthOf(d)
          })
        }
        },
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "int$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "int$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$2", "symbols": ["int$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "int", "symbols": ["int$ebnf$1", "int$ebnf$2"], "postprocess": 
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
        },
    {"name": "jsonfloat$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "jsonfloat$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$2", "symbols": ["jsonfloat$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": ["jsonfloat$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "jsonfloat$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "jsonfloat$ebnf$3", "symbols": ["jsonfloat$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [/[+-]/], "postprocess": id},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": ["jsonfloat$ebnf$4$subexpression$1$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$4$subexpression$1", "symbols": [/[eE]/, "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "jsonfloat$ebnf$4$subexpression$1$ebnf$2"]},
    {"name": "jsonfloat$ebnf$4", "symbols": ["jsonfloat$ebnf$4$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat", "symbols": ["jsonfloat$ebnf$1", "jsonfloat$ebnf$2", "jsonfloat$ebnf$3", "jsonfloat$ebnf$4"], "postprocess": 
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
        },
    {"name": "decimal$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$2", "symbols": ["decimal$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": ["decimal$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "decimal$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "decimal$ebnf$3", "symbols": ["decimal$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "decimal$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal", "symbols": ["decimal$ebnf$1", "decimal$ebnf$2", "decimal$ebnf$3"], "postprocess": 
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
        },
    {"name": "percentage", "symbols": ["decimal", {"literal":"%"}], "postprocess": 
        (d, l) => {
          return {
            n: d[0] / 1000,
            location: l,
            length: lengthOf(d)
          }
        }
        },
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": (d) => d[1].join("")},
    {"name": "dstrchar", "symbols": [/[^\\"\n]/], "postprocess": id},
    {"name": "dstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": 
        (d) => JSON.parse("\""+d.join("")+"\"")
        },
    {"name": "sstrchar", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "sstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": (d) => JSON.parse("\""+d.join("")+"\"")},
    {"name": "sstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "sstrchar", "symbols": ["sstrchar$string$1"], "postprocess": (d) => "'"},
    {"name": "strescape", "symbols": [/["\\/bfnrt]/], "postprocess": id},
    {"name": "strescape", "symbols": [{"literal":"u"}, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/], "postprocess": 
        (d) => d.join("")
        },
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": id},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": id},
    {"name": "___$ebnf$1", "symbols": [/[ \t]/]},
    {"name": "___$ebnf$1", "symbols": ["___$ebnf$1", /[ \t]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "___", "symbols": ["___$ebnf$1"], "postprocess": id},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id}
]
  , ParserStart: "block"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
