const arc = require('@architect/functions')
const handle = require('@architect/shared/handle')

exports.handler = handle(async (event) => {
  const tables = await arc.tables()
  for (const record of event.Records) {
    await tables.test.put({
      key: record.key,
      value: record.value
    })
  }
})
