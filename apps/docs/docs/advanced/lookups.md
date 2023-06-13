---
sidebar_position: 3
---

import ImageAnnotation from '@site/src/components/ImageAnnotation/ImageAnnotation';
import NewLookup1Image from './img/NewLookup1.png';
import NewLookup2Image from './img/NewLookup2.png';
import NewFilter1Image from './img/NewFilter1.png';

# Table Lookups & Filters

Lookups and filters are powerful techniques for accessing specific data within tables.

### Table Lookups

:::tip Syntax

`lookup(Table, Table Column Condition)`

- `Table`: Specifies the target table.
- `Table Column Condition`: Defines the search condition.

:::

The `lookup()` formula allows you to access rows and values from a table for inspection or reuse.

<ImageAnnotation
alt="Custom Formula Example"
navigationButtons
firstSelectedByDefault
isOnlyOnHover
caption="To select a specific value from a table using the <code>lookup()</code> formula, follow these steps:"
steps={[
{
src: NewLookup1Image,
value: 1,
xPercent: 28,
yPercent: 61,
widthPercent: 43,
heightPercent: 10,
description: `
Lookup a table Row that matches a condition:

<ul>
<li>Set the table name as the first parameter (e.g., <code>Expenses</code>).</li>
<li>Specify the condition to match the table column as the second parameter (e.g., <code>Expenses.Item == "Rent"</code>).</li>
<li>Here is how it should look like: <code>lookup(Expenses, Expenses.Item == "Rent")</code></li>
</ul>
`,
},
{
src: NewLookup2Image,
value: 2,
      xPercent: 28,
      yPercent: 68,
      widthPercent: 16,
      heightPercent: 8,
description: `Optional: Selecting the column:
    <ul>
      <li>Append a dot (<code>.</code>) after the <code>lookup()</code> formula.</li>
      <li>Specify the column name to select the desired value (e.g., <code>.Amount</code>).</li>
      <li>Here is how it should look like: <code>lookup(Expenses, Expenses.Item == "Rent").Amount</code></li>
    </ul>
`,
},
]}
/>

### Table Filtering

:::tip Syntax

`filter(Table, Table Column Condition)`

- `Table`: Refers to the target table.
- `Table Column Condition`: Defines the filtering condition.

:::

The `filter()` formula enables you to extract specific rows from a table based on specified conditions.

<ImageAnnotation
alt="Custom Formula Example"
caption="To filter values from a table using the <code>filter()</code> formula, use the following steps:"
navigationButtons
firstSelectedByDefault
isOnlyOnHover
steps={[
{
src: NewFilter1Image,
value: 1,
xPercent: 30.2,
yPercent: 61,
widthPercent: 16,
heightPercent: 10,
description: `Specify the table name as the first parameter (e.g., <code>Expenses</code>).`,
},
{
src: NewFilter1Image,
value: 2,
xPercent: 45.5,
yPercent: 61,
widthPercent: 25,
heightPercent: 10,
description: `Define the filtering condition as the second parameter (e.g., <code>Expense.Amount &lt;= $500</code>).`,
},
]}
/>

The resulting table will contain only the rows that match the specified condition.
