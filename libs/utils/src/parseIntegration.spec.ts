import {
  parseIntegration,
  parseIntegrationJs,
  addEnvVars,
} from './parseIntegration';

const functionBody = `
  const endpoint = \`https://api.airtable.com/v0/\${baseId}/\${encodeURIComponent(tableName)}\`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer $\{process.env.AIRTABLE_API_KEY}\`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  const data = await response.json();
  const records = data.records;

  // Process the data into tabulated form
  const tabulatedData = records.reduce((acc, record) => {
    Object.keys(record.fields).forEach((key) => {
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record.fields[key]);
    });
    return acc;
  }, {});

  return tabulatedData;
`;

const docString = `/**
 * Fetches data from an Airtable table.
 * @param {string} baseId The unique identifier for the Airtable Base.
 * @param {string} tableName The name of the table within the Airtable Base.
 * @returns {Promise<Object>} The data from the Airtable table in tabulated form.
 */
`;

const mdString = `Certainly! To fetch data from an Airtable table, you'll need the Base ID of the Airtable Base, the Table Name, and an API key which should be stored securely in your environment variables. Here's a function that does just that:
\`\`\`JavaScript
${docString}
const fetchAirtableData = async (baseId, tableName) => {${functionBody}};
\`\`\`
`;

describe('addEnvVars', () => {
  it('should add env vars', () => {
    const res = addEnvVars(
      functionBody,
      new Map([
        ['AIRTABLE_API_KEY', 'airtableApiKey'],
        ['TEST_VAR', 'testVar'],
      ])
    );
    expect(res).toMatchInlineSnapshot(`
      "const process = {
        env: {
          AIRTABLE_API_KEY: \\"{{{secrets.airtableApiKey}}}\\",
          TEST_VAR: \\"{{{secrets.testVar}}}\\"
        }
      };


        const endpoint = \`https://api.airtable.com/v0/\${baseId}/\${encodeURIComponent(tableName)}\`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const records = data.records;

        // Process the data into tabulated form
        const tabulatedData = records.reduce((acc, record) => {
          Object.keys(record.fields).forEach((key) => {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record.fields[key]);
          });
          return acc;
        }, {});

        return tabulatedData;
      "
    `);
  });
});

describe('parseIntegration', () => {
  it('should parse an integration', async () => {
    const parsed = await parseIntegration(mdString);

    expect(parsed).toMatchInlineSnapshot(`
      Object {
        "content": "Certainly! To fetch data from an Airtable table, you'll need the Base ID of the Airtable Base, the Table Name, and an API key which should be stored securely in your environment variables. Here's a function that does just that:
      ",
        "envVars": Array [
          "AIRTABLE_API_KEY",
        ],
        "fnName": "fetchAirtableData",
        "functionBody": "const endpoint = \`https://api.airtable.com/v0/\${this.baseId}/\${encodeURIComponent(this.tableName)}\`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const records = data.records;

        // Process the data into tabulated form
        const tabulatedData = records.reduce((acc, record) => {
          Object.keys(record.fields).forEach((key) => {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record.fields[key]);
          });
          return acc;
        }, {});

        return tabulatedData;",
        "jsDocParams": Object {
          "baseId": Object {
            "description": "The unique identifier for the Airtable Base.",
            "type": "string",
          },
          "tableName": Object {
            "description": "The name of the table within the Airtable Base.",
            "type": "string",
          },
        },
        "params": Array [
          "baseId",
          "tableName",
        ],
      }
    `);
  });
});

const arrowfunction = `const fetchAirtableData = async (baseId, tableName) => {${functionBody}};`;
const commentedArrowfunction = `${docString}\nconst fetchAirtableData = async (baseId, tableName) => {${functionBody}};`;
const anonymousFunction = `const fetchAirtableData = async function(baseId, tableName) {${functionBody}};`;
const commentedAnonymousFunction = `${docString}\nconst fetchAirtableData = async function(baseId, tableName) {${functionBody}};`;
const namedFunction = `async function fetchAirtableData(baseId, tableName) {${functionBody}};`;
const commentedNamedFunction = `${docString}\nasync function fetchAirtableData(baseId, tableName) {${functionBody}};`;

describe('parseIntegrationJs', () => {
  it('should parse an arrow function', async () => {
    const parsed = parseIntegrationJs(arrowfunction);

    expect(parsed).toMatchInlineSnapshot(`
      Object {
        "envVars": Array [
          "AIRTABLE_API_KEY",
        ],
        "fnName": "fetchAirtableData",
        "functionBody": "const endpoint = \`https://api.airtable.com/v0/\${this.baseId}/\${encodeURIComponent(this.tableName)}\`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const records = data.records;

        // Process the data into tabulated form
        const tabulatedData = records.reduce((acc, record) => {
          Object.keys(record.fields).forEach((key) => {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record.fields[key]);
          });
          return acc;
        }, {});

        return tabulatedData;",
        "jsDocParams": Object {},
        "params": Array [
          "baseId",
          "tableName",
        ],
      }
    `);
  });
  it('should parse an arrow function with doc string', async () => {
    const parsed = parseIntegrationJs(commentedArrowfunction);

    expect(parsed).toMatchInlineSnapshot(`
      Object {
        "envVars": Array [
          "AIRTABLE_API_KEY",
        ],
        "fnName": "fetchAirtableData",
        "functionBody": "const endpoint = \`https://api.airtable.com/v0/\${this.baseId}/\${encodeURIComponent(this.tableName)}\`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const records = data.records;

        // Process the data into tabulated form
        const tabulatedData = records.reduce((acc, record) => {
          Object.keys(record.fields).forEach((key) => {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record.fields[key]);
          });
          return acc;
        }, {});

        return tabulatedData;",
        "jsDocParams": Object {
          "baseId": Object {
            "description": "The unique identifier for the Airtable Base.",
            "type": "string",
          },
          "tableName": Object {
            "description": "The name of the table within the Airtable Base.",
            "type": "string",
          },
        },
        "params": Array [
          "baseId",
          "tableName",
        ],
      }
    `);
  });

  it('should parse an anonymous function', async () => {
    const parsed = parseIntegrationJs(anonymousFunction);

    expect(parsed).toMatchInlineSnapshot(`
      Object {
        "envVars": Array [
          "AIRTABLE_API_KEY",
        ],
        "fnName": "fetchAirtableData",
        "functionBody": "const endpoint = \`https://api.airtable.com/v0/\${this.baseId}/\${encodeURIComponent(this.tableName)}\`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const records = data.records;

        // Process the data into tabulated form
        const tabulatedData = records.reduce((acc, record) => {
          Object.keys(record.fields).forEach((key) => {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record.fields[key]);
          });
          return acc;
        }, {});

        return tabulatedData;",
        "jsDocParams": Object {},
        "params": Array [
          "baseId",
          "tableName",
        ],
      }
    `);
  });

  it('should parse an anonymous function with doc string', async () => {
    const parsed = parseIntegrationJs(commentedAnonymousFunction);

    expect(parsed).toMatchInlineSnapshot(`
      Object {
        "envVars": Array [
          "AIRTABLE_API_KEY",
        ],
        "fnName": "fetchAirtableData",
        "functionBody": "const endpoint = \`https://api.airtable.com/v0/\${this.baseId}/\${encodeURIComponent(this.tableName)}\`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const records = data.records;

        // Process the data into tabulated form
        const tabulatedData = records.reduce((acc, record) => {
          Object.keys(record.fields).forEach((key) => {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record.fields[key]);
          });
          return acc;
        }, {});

        return tabulatedData;",
        "jsDocParams": Object {
          "baseId": Object {
            "description": "The unique identifier for the Airtable Base.",
            "type": "string",
          },
          "tableName": Object {
            "description": "The name of the table within the Airtable Base.",
            "type": "string",
          },
        },
        "params": Array [
          "baseId",
          "tableName",
        ],
      }
    `);
  });

  it('should parse a named function', async () => {
    const parsed = parseIntegrationJs(namedFunction);

    expect(parsed).toMatchInlineSnapshot(`
      Object {
        "envVars": Array [
          "AIRTABLE_API_KEY",
        ],
        "fnName": "fetchAirtableData",
        "functionBody": "const endpoint = \`https://api.airtable.com/v0/\${this.baseId}/\${encodeURIComponent(this.tableName)}\`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const records = data.records;

        // Process the data into tabulated form
        const tabulatedData = records.reduce((acc, record) => {
          Object.keys(record.fields).forEach((key) => {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record.fields[key]);
          });
          return acc;
        }, {});

        return tabulatedData;",
        "jsDocParams": Object {},
        "params": Array [
          "baseId",
          "tableName",
        ],
      }
    `);
  });

  it('should parse a named function with doc string', async () => {
    const parsed = parseIntegrationJs(commentedNamedFunction);

    expect(parsed).toMatchInlineSnapshot(`
      Object {
        "envVars": Array [
          "AIRTABLE_API_KEY",
        ],
        "fnName": "fetchAirtableData",
        "functionBody": "const endpoint = \`https://api.airtable.com/v0/\${this.baseId}/\${encodeURIComponent(this.tableName)}\`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const records = data.records;

        // Process the data into tabulated form
        const tabulatedData = records.reduce((acc, record) => {
          Object.keys(record.fields).forEach((key) => {
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record.fields[key]);
          });
          return acc;
        }, {});

        return tabulatedData;",
        "jsDocParams": Object {
          "baseId": Object {
            "description": "The unique identifier for the Airtable Base.",
            "type": "string",
          },
          "tableName": Object {
            "description": "The name of the table within the Airtable Base.",
            "type": "string",
          },
        },
        "params": Array [
          "baseId",
          "tableName",
        ],
      }
    `);
  });
});
