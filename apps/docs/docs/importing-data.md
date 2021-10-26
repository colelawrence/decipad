---
sidebar_position: 20
---

# Importing data

You can import data from an external file directly in the language. To do that you'll need to use a function called `import_data`, followed by an URL.

In this example I've uploaded a CSV file to Github and I have the URL for it.

```deci live
import_data "https://decipad-packages.s3.eu-west-2.amazonaws.com/static/example-1.csv"
```

Deci supports the following file types:

- CSV files (comma-separated text format, which is exportable from most spreadsheet apps)
- [Arrow files](https://arrow.apache.org)

## Name imported data

As usual, you can give a name to imported data like this, so that you can use later:

```deci live
my_table_name = import_data "https://decipad-packages.s3.eu-west-2.amazonaws.com/static/example-1.csv"

my_table_name.Col1
```

## Access columns

In this previous example we were extracting a list from a table by using the `.` operator like this:

```deci live
my_table_name = import_data "https://decipad-packages.s3.eu-west-2.amazonaws.com/static/example-1.csv"

my_table_name.Col2
```

You can check [the section about lists](/docs/lists) if you want to learn what you can do with them.
