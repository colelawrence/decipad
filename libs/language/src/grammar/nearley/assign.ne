
@lexer tokenizer

assign            -> assignTarget equalSign expression  {%
                                                        (d) => addArrayLoc({
                                                          type: 'assign',
                                                          args: [d[0], d[2]]
                                                        }, d)
                                                        %}

assignTarget      -> identifier nullableIdentifier      {%
                                                        (d) => {

                                                          function parseThing(obj, name) {
                                                            if (obj.length === 0) {
                                                              return name;
                                                            }
                                                            const whitespace = obj[0][0].text;
                                                            const n = obj[1].name;
                                                            obj = obj.slice(2);

                                                            return parseThing(obj[0], name + whitespace + n);
                                                          }

                                                          let extra = "";
                                                          if (d.length > 1) {
                                                            extra = parseThing(d[1], "");
                                                          }

                                                          extra = d[0].name + extra;


                                                          return addLoc({
                                                            type: 'def',
                                                            args: [extra]
                                                          }, d[0])
                                                        }
                                                        %}

nullableIdentifier -> null
nullableIdentifier -> [\s]:+ identifier nullableIdentifier
