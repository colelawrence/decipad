---
sidebar_position: 11
sidebar_class_name: new
---

# Code: Data from APIs

 <div style={{position: 'relative', paddingBottom: '59.01639344262295%', height: 0}}>
   <iframe src="https://www.loom.com/embed/c3d2177a8b744ea7b8a939bdbd3881dc?sid=0388946a-9b00-4095-b8f5-4acc3f3cec75" frameBorder={0} webkitallowfullscreen mozallowfullscreen allowFullScreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} />
 </div>

<br />

Retrieve data from web APIs and import it into Decipad using our Code Integration feature. To create a code integration, add a new integration block and choose "Code" (see [Integration Basics](/docs/integrations/basics) for details). In the code editor, you'll find an example that showcases how to fetch data from a public web API:

## Running Code

![code editor](./img/code-codeeditor.png)

In order to get data from a code integration into your document, you need to first run the code with the "Run"-button. Once ran, you can then continue to the result preview either via the navigation bar, or the "Continue"-button. Upon running the code, we will show you a small console at the bottom of the code block so you get feedback on any errors that may occur.

## Previewing Data

![result preview](./img/code-preview.png)

On the preview pane you will see the result and the format it will be available in in your document. Here you can change the type of the columns or simple result, and make sure that you actually got the data you wanted. Once done with this step, the "Insert"-button will give you a new integration block that you can re-use in your document just like any other variable (see [Integration Basics](/docs/integrations/basics) for details).

## Private Keys

To query against a private API, you can use our API secret feature to make sure that your actual credentials are not exposed when publishing or sharing your notebook. To add an API secret go to your workspace and select "Data Connections" from the sidebar menu. After saving your API key, it will the be available for insertion in all notebooks in your workspace.

:::note Examples
For security reasons, API secrets can only be used directly in a `fetch()` statement. You can not assign them to variables or use them arbitrarily.
:::
