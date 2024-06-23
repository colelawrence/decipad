---
sidebar_position: 4
toc_min_heading_level: 2
---

# Tables

Tables help you organize data, making it easier to read and understand. You can also use tables to perform calculations using formulas.

import YouTubePlayer from '@site/src/components/VideoCards/videos';

<YouTubePlayer videoId="sCGiQr9_iD4" thumbnailUrl="/docs/img/thumbnails/thumbnail-tables.png" />

## Creating a Table

To create a new table, go to your notebook, click the `+` button next to an empty line, select `Table` from the menu.

1. **Adding Formulas to a Table**:

   - Formulas let you add calculated columns to your table.
   - To add formulas to a table, press the equals sign (`=`) in any cell. A new formula bar will show up where you can type your formula.
   - Alternatively, add formulas to a column by clicking on the `▼` column menu and selecting `Formula`.
   - To hide the formulas, click the `ƒ` button at the top of the table. To show them click `ƒ` again.
   - [Learn more about Formulas →](/docs/quick-start/formulas)

2. **Adding Quick Calculation Insights**:

   - Summary rows let you add quick calculated insights to any column.
   - To add a summary row, click the `Calculate` button at the end of your table.
   - Select the desired calculation based on the column's data type (e.g., sum, count).
   - You can reuse these calculations across your notebook with drag and drop:
     - [Learn more about Inline Results →](/docs/quick-start/inline-results)
     - [Learn more about Formulas →](/docs/quick-start/formulas)

3. **Adding Units to Table Values**:

   - Add units to table values to add context.
   - For example, enter `$10` or `5oz` for currency or a measurement, Decipad will understand what you mean.
   - Alternatively, go to the `▼` column menu and add your custom unit to the whole column directly.

4. **Updating Table and Column Names**:

   - Update the default table name by replacing it in the top left corner.
   - Update column names by clicking on the existing name and selecting a new one.

5. **Adding and Deleting Columns and Rows**:

   - Add new columns by clicking the `+` button on the right side.
   - Delete a column by clicking the upside-down triangle button on the column and selecting `Delete column`.
   - Add new rows by clicking the `+ Add row` button at the end.
   - Delete or insert rows by hovering over a row, clicking the `⸬` button, and selecting the desired action.

6. **Rearranging Table Columns and Rows**:

   - Rearrange columns and rows by dragging and dropping within the table.
   - To move a row, click and hold the `⸬` button on the left side and drag it to a new position.
   - To move a column, click and hold the `⸬` button on the left side of the column name and drag it to a new position.

7. **Updating Column Data Types**:

   - Hover over the column header, click the drop-down triangle button, and choose a new column type from the list.

8. **Adding Column Series**:

   - Create a column series by selecting `Series`, then `Date` in the column's `Change type` menu. Specify the starting point, and subsequent dates will be calculated automatically.

9. **Adding Column Categories**:

   - Create a column category by selecting `Categories` from the `▼` column menu. This adds a dropdown to your column, allowing easy reuse of values with a picker.

10. **Customizing Table Appearance**:

    - Change the color and icon of your table by clicking the grid icon next to the table name.
    - Select a new color and icon from the menu to give your table a unique appearance.

## Referencing Columns

You can easily reuse and incorporate values from any column in your calculations.

To reference a table column in a calculation, follow these steps:

1. Type the table name.
2. Use a dot `.` to indicate the specific column within the table.
3. Append the column name after the dot.

For example, if your table is named "Table" and you want to access the "Column" within it, write it as:

`Table.Column`

### Example: Summing a Column

Let's consider an example where you want to sum the values in a sales table.

Assuming you have a table named "SalesData" with a column named "SalesPrice", you can calculate the sum using this syntax: `sum(SalesData.SalesPrice)`. This calculation can be used in a **formula block** or another **column formula**.

This syntax can be customized for other calculations as well. For instance, you can calculate the **average**, **minimum**, **maximum**, or apply other mathematical operations to the column values. [Learn more about Formulas for Tables→](/docs/quick-start/formulas)

You can expand on this by incorporating additional calculations, such as calculating the tax for all sales:

`sum(SalesData.SalesPrice) + tax`

### Compact Format: Referencing Columns in the Same Table

Within the same table, it is easy to reference other columns and reuse their values.

Let's continue with the example of a sales table. If you want to calculate the tax per item instead of the tax for all sales, you can add a new formula column and write `SalesData.SalesPrice + tax`. This calculation will determine the tax for each individual item based on its row.

Since you are working within the same table, you can use the compact format that only requires a reference to the column name: `SalesPrice + tax`. Decipad will automatically calculate the tax for each row, considering the values from the respective rows in the table.

## Exporting Table as CSV (Plus & Team Plan Feature)

This functionality is exclusively accessible to Plus and Team plans subscribers. For detailed information regarding each plan, kindly refer to our [pricing page](https://www.decipad.com/pricing).

To export any table within your Notebook as a CSV file:

1. Click on the table options button (`⸬`) located next to the table name.
2. Select `Download as CSV`.
3. Depending on your browser settings, you might be prompted to grant permissions for app.decipad.com to download files to your device.

## Code Tables (Legacy)

Code tables are an alternative to low-code tables. They only work with **Advanced formula** blocks.

:::tip Syntax

```
TableName = {
  Column1 = [Value1, Value2, ...]
  Column2 = [Value1, Value2, ...]
  Column2 = [Value1, Value2, ...]
}

```

:::

:::note Example

```
MyTable = {
  A = [1, 2, 3]
  B = [4, 5, 6]
}
```

:::
