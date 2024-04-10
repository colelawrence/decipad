---
sidebar_position: 11
---

# JavaScript Imports

Import data from web APIs into Decipad using javascript.

<div style={{position: 'relative', paddingBottom: '59.01639344262295%', height: 0}}>
  <iframe src="https://www.loom.com/embed/c3d2177a8b744ea7b8a939bdbd3881dc?sid=0388946a-9b00-4095-b8f5-4acc3f3cec75?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true" frameBorder={0} webkitallowfullscreen mozallowfullscreen allowFullScreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} />
</div>

<br />

## Importing Data with JavaScript in a Notebook

1. Begin by typing `/integrations` on an empty paragraph.
2. Select `Code` from the integration options.
3. Write your JavaScript code to fetch your data, then press `Run` to execute it.
4. Utilize the preview tab to adjust data types if necessary.
5. Click `Insert` to add the data into your notebook.

Once your integration is added to your notebook, you can use the refresh button to update the table with the latest data.

## Integration Private Keys

<div style={{position: 'relative', paddingBottom: '59.01639344262295%', height: 0}}>
  <iframe src="https://www.loom.com/embed/c3d2177a8b744ea7b8a939bdbd3881dc?sid=bd1b9899-441d-451a-af65-206e219a53a1?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true" frameBorder={0} webkitallowfullscreen mozallowfullscreen allowFullScreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} />
</div>

<br />

Private keys provide secure access control for your code by restricting unauthorized users.

1.  **To set up a new key**:
    - Go to your workspace and click on "Integration Secrets". You can add a new value or remove old keys.
    - Alternatively, click on "Insert Secret" in the JavaScript code editor within your integrations panel.
2.  **To reuse your private key**:
    - Click on "Insert Secret" in the JavaScript code editor and select the desired secret. A line of code will be automatically added to your script.

**Note:** For security reasons, API secrets can only be used directly in a `fetch()` statement. You can't assign them to variables or use them arbitrarily.
