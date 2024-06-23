import { addEnvVars } from './addEnvVars';

describe('addEnvVars', () => {
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
