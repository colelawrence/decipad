---
sidebar_position: 21
---

# SQL Imports

Easily import your data into Decipad using SQL.

import YouTubePlayer from '@site/src/components/VideoCards/videos';

<YouTubePlayer videoId="irTKNI61DPA" thumbnailUrl="/docs/img/thumbnails/thumbnail-sql-integrations.png" />

<br />

## Connecting a Database to Decipad

To import data into your Decipad Notebook using SQL, you need to start by connecting Decipad to a Database:

1. Go to your [workspace](https://app.decipad.com/w).
2. Select `Settings and Members` and then click on `Data Connections`.
3. Choose the `SQL` tab and click `Add new connection`. You can pick from **mysql**, **bigquery**, **oracle**, **postgresql**, **mariadb**, **mssql**, **redshift** and **cockroachdb**.
4. Provide either a link or your access credentials to connect your database.
5. After configuring, test your connection. If successful, click `Add` to integrate it into your workspace.

## Importing Data with SQL in a Notebook

After connecting your database to your Decipad workspace, follow these steps to import data into any notebook:

1. Type `/integrations` on an empty paragraph.
2. Choose `SQL` from the integration options.
3. Select your database from the connections picker located at the top right.
4. Write your SQL query and press `Run` to execute it.
5. Utilize the preview tab to adjust data types if needed.
6. Click `Insert` to add the data into your notebook.

Once your integration is added to your notebook, you can use the refresh button to update the table with the latest data.
