---
sidebar_position: 4
toc_min_heading_level: 2
---

# Tables

Tables help you organize data, making it easier to read and understand. You can also use tables to perform calculations using formulas.

import YouTubePlayer from '@site/src/components/VideoCards/videos';

<YouTubePlayer videoId="sCGiQr9_iD4" thumbnailUrl="/docs/img/thumbnails/thumbnail-tables.png"/>

## Create a Table

**To create a new table**, go to your notebook, click the `+` button next to an empty line and select `Table` from the menu, or you can open the block menu by typing `/` on an empty paragraph, select `Table` using the `arrow keys`, and press `enter`.

1. **Add Formulas to a Table**:

   - You can add formulas to a table by clicking on any cell and starting with the equals sign (`=`).
   - Alternatively, you can add formulas to a column by clicking on the column `▼` and selecting `Formula`.

2. **Add Quick Calculation Insights**:

   - Click the `Calculate` button at the end of your table to perform quick calculations.
   - Select the desired calculation based on the data type in the column (e.g., sum, count).
   - The available calculations depend on the type of data in your table.

   You can easily drag and drop these calculations results:

   - Into your text to explain them. [Learn more about Inline Results →](/docs/quick-start/inline-numbers)
   - Into your formulas to reuse them. [Learn more about Formulas →](/docs/formulas)

3. **Add Units to Table Values**:

   - To add units to table values, include them as text in the respective cell.
   - For example, you can enter `$10` or `5oz` to indicate a currency or measurement.
   - Alternatively, you can format a column to display units by clicking on the column `▼` and adding your custom unit.

4. **Add Units to Columns**:

   - Click the down triangle button on a column, select `Change type`, and enter a new unit in the `create custom` field.

5. **Update Table and Column Names**:

   - After creating a table, you can update its default name by replacing it in the top left corner of the table.
   - To update column names, click on the existing name and select a new one.

6. **Add and Delete Columns and Rows**:

   - Add new columns by clicking the `+` button on the right side of the table.
   - Delete a column by clicking the upside-down triangle button on the column and selecting `Delete column`.
   - Add new rows by clicking the `+ Add row` button at the end of the table.
   - Delete rows or insert new ones by hovering over a row, clicking the `⸬` button, and selecting the desired action.

7. **Rearrange Table Columns and Rows**:

   - You can rearrange table columns and rows by dragging and dropping them within the same table.
   - To move a row, click and hold the `⸬` button on the left side of the row and drag it to a new position.
   - To move a column, click and hold the `⸬` button on the left side of the column name and drag it to a new position.

To **delete a column**, click the **`⸬`** button on a column and select `Delete column`.

8. **Update Column Data Types**:

   - Hover over the column header, click the drop-down triangle button on a column, and choose a new column type from the list.

9. **Add Column Series**:

   - Create a column series by selecting `Series` and then `Date` in the column's `Change type` menu. Specify the starting point, and subsequent dates will be calculated automatically.

10. **Hide Table Formulas**:

    - Click the `Hide formulas` button on top of the table to hide table formulas. Click the `Show formulas` button to display them again.

11. **Customizing Table Appearance**:

    - Change the color and icon of your table by clicking the grid icon next to the table name.
    - Select a new color and icon from the menu to give your table a unique personality.

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

This syntax can be customized for other calculations as well. For instance, you can calculate the **average**, **minimum**, **maximum**, or apply other mathematical operations to the column values. [Learn more about Formulas for Tables→](/docs/formulas)

You can expand on this by incorporating additional calculations, such as calculating the tax for all sales:

`sum(SalesData.SalesPrice) + tax`

### Compact Format: Referencing Columns in the Same Table

Within the same table, it is easy to reference other columns and reuse their values.

Let's continue with the example of a sales table. If you want to calculate the tax per item instead of the tax for all sales, you can add a new formula column and write `SalesData.SalesPrice + tax`. This calculation will determine the tax for each individual item based on its row.

Since you are working within the same table, you can use the compact format that only requires a reference to the column name: `SalesPrice + tax`. Decipad will automatically calculate the tax for each row, considering the values from the respective rows in the table.

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
