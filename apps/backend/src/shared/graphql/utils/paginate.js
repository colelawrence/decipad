async function paginate(table, query, page, map) {
  const { cursor, maxItems } = page;

  query.Limit = maxItems;

  if (cursor) {
    query.ExclusiveStartKey = cursor;
  }

  const result = await table.query(query);
  let items = result.Items;
  if (map) {
    const mappedItems = [];
    for (const item of items) {
      const retItem = await map(item);
      mappedItems.push(retItem);
    }
    items = mappedItems;
  }

  return {
    items,
    count: items.length,
    hasNextPage: !!result.LastEvaluatedKey,
    cursor: result.LastEvaluatedKey,
  };
}

module.exports = paginate;
