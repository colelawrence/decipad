---
sidebar_position: 11
sidebar_class_name: new
---

# Code: Data from APIs

import YouTubePlayer from '@site/src/components/VideoCards/videos';

<YouTubePlayer videoId="RMrxUdhKVlE" thumbnailUrl="/docs/img/thumbnails/thumbnail-code-integrations.png" />

<br />

Retrieve data from web APIs and import it into Decipad using our Code Integration feature. To create a code integration, add a new integration block and choose "Code" (see [Integration Basics](/docs/integrations/basics) for details). In the code editor, you'll find an example that showcases how to fetch data from a public web API:

## Running Code

![code editor](./img/code-codeeditor.png)

In order to get data from a code integration into your document, you need to first run the code with the "Run"-button. Once ran, you can then continue to the result preview either via the navigation bar, or the "Continue"-button. Upon running the code, we will show you a small console at the bottom of the code block so you get feedback on any errors that may occur.

## Previewing Data

![code editor](./img/code-preview.png)

On the preview pane you will see the result and the format it will be available in in your document. Here you can change the type of the columns or simple result, and make sure that you actually got the data you wanted. Once done with this step, the "Insert"-button will give you a new integration block that you can re-use in your document just like any other variable (see [Integration Basics](/docs/integrations/basics) for details).

## Private Keys (Coming Soon)

We have a future update planned that will introduce the option to specify private keys, ensuring secure reuse within your code. With this feature, you will be able to protect your API setup and restrict access from unauthorized users. Stay tuned for more information on how to utilize private keys effectively or contact us via [support@decipad.com](mailto:support@decipad.com).

<!--
## Private Keys

Private keys provide secure access control for your code by restricting unauthorized users.

1. **To set up a new key**:

   - Go to your workspace and click on "Integration Secrets". You can add a new value or remove old keys.
   - Alternatively, click on "Insert Secret" in the JavaScript code editor within your integrations panel.

2. **To reuse your private key**:
   - Click on "Insert Secret" in the JavaScript code editor and select the desired secret. A line of code will be automatically added to your script.
-->
