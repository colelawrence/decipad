---
sidebar_position: 13
sidebar_class_name: hide-from-sidebar
---

# Retired features

## Select

You will get this error when you attempt to use our retired feature select().

```deci live
Table = {
  A = 1
  B = 2
}
select(Table, A)
==> You're using a feature that's been retired
```

`select()` has been retired as it hinders Decipad's ability to understand tables internally and empower users to do more with them.

If you needed `select()`'s functionality, you can create a new table. This is not recommended because the new table won't be connected to the old one.

```deci live
Table = {
  A = 1
  B = 2
}
NewTable = {
  A = Table.A
}
==> {
  A = [ 1 ]
}
```

## Table spread

When creating a table using the table spread syntax, you get this error:

```deci live
Table = {
  A = 1
}
Table2 = {
  ...Table
  B = 2
}
==> You're using a feature that's been retired
```

The table spread syntax has been retired, but you can instead extend existing tables:

```deci live
Table = {
  A = 1
}
Table.B = 2
Table
==> {
  A = [ 1 ],
  B = [ 2 ]
}
```

## Splitby

If you attempt to use the `splitby` function, you get an error.

```deci live
TableToSplitBy = {
  Column = ["A", "B", "C"]
  SplitKey = [1, 2, 2]
}

splitby(TableToSplitBy, TableToSplitBy.Column)
==> Error in operation "splitby" (table, column): You're using a feature that's been retired
```

This feature has been retired to improve our internal support of tables.
