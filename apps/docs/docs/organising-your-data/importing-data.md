---
sidebar_position: 130
---

# Importing data

You can get data from an external file in the language. To do that you'll need to use a function called `fetch`, followed by an URL.

In this example I've uploaded a CSV file to Github and I have the URL for it.

```deci live
fetch "https://decipad-packages.s3.eu-west-2.amazonaws.com/static/example-1.csv"
==> fetch is not defined
```

Decipad supports the following file types:

- CSV files (comma-separated text format, which is exportable from most spreadsheet apps)
- [Arrow files](https://arrow.apache.org)

You can check [the section about tables](/docs/organising-your-data/tables) if you want to learn what you can do with them.

## Name imported data

Give a name to your imported data:

```deci live
MyExample = fetch "https://decipad-packages.s3.eu-west-2.amazonaws.com/static/example-1.csv"

MyExample.Col1
==> fetch is not defined
```

## Access columns

In this previous example we were extracting a list from a table by using the `.` operator like this:

```deci live
MyExample = fetch "https://decipad-packages.s3.eu-west-2.amazonaws.com/static/example-1.csv"

MyExample.Col2
==> fetch is not defined
```

You can check [the section about lists](/docs/organising-your-data/lists) if you want to learn what you can do with them.
