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

 <div style={{position: 'relative', paddingBottom: '59.01639344262295%', height: 0}}>
   <iframe src="https://www.loom.com/embed/c3d2177a8b744ea7b8a939bdbd3881dc?sid=bd1b9899-441d-451a-af65-206e219a53a1" frameBorder={0} webkitallowfullscreen mozallowfullscreen allowFullScreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} />
 </div>

<br/>

Private keys provide secure access control for your code by restricting unauthorized users.
 1. **To set up a new key**:
    - Go to your workspace and click on "Integration Secrets". You can add a new value or remove old keys.
    - Alternatively, click on "Insert Secret" in the JavaScript code editor within your integrations panel.
 2. **To reuse your private key**:
    - Click on "Insert Secret" in the JavaScript code editor and select the desired secret. A line of code will be automatically added to your script.


**Note:** For security reasons, API secrets can only be used directly in a `fetch()` statement. You can't assign them to variables or use them arbitrarily.

