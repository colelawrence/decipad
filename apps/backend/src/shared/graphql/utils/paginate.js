async function paginate(table, query, page, map) {
  const { cursor, maxItems } = page;

  query.Limit = maxItems;

  if (cursor) {
    query.ExclusiveStartKey = cursor;
  }

  const result = await table.query(query);
  const items = map ? result.Items.map(map) : result.Items;

  return {
    items,
    count: items.length,
    hasNextPage: !!result.LastEvaluatedKey,
    cursor: result.LastEvaluatedKey,
  };
}

module.exports = paginate;
