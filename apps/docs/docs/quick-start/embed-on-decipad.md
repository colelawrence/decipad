---
sidebar_position: 22
hide_table_of_contents: false
sidebar_class_name: new
---

# Embed on Decipad

Easily embed slides, videos, or other content from external websites into Decipad.

## Adding an Embed

Many apps and services offer HTML code that can be embedded in other locations. You can use this code to embed content in Decipad. Here are the steps on how to do it:

1. In your chosen app, copy the HTML code for embedding and extract its URL parameter. The URL can usually be found next to the "src=" keyword within the iframe code, and it should look something like this:

   ```
   <iframe
       src="https://www.example.com/your-embed-url"
       frameborder="0"
       allowfullscreen
       style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
   ></iframe>
   ```

2. In Decipad, either type "/embed" or click the "Embed" option in the side menu to open the embed dialog.
3. Paste the URL link you obtained from the HTML code and click "Insert." This will add a block with your embed to your notebook.

## Embed from Popular Apps

### Google Slides

To embed slides from Google Slides into Decipad, follow these steps:

1. Open your Google Slides presentation.
2. Click the "Share" button at the top right.
3. Change the permission setting from "Restricted" to "Anyone with the link can view."
4. Go to the "File" menu at the top left, select "Share," and then choose "Publish to web."
5. Click on the "Embed" tab, and you will see a code like this:
  ```
    <iframe
      src="Your-Google-Slide-Embed-Link"
      frameborder="0"
      width="960"
      height="569"
      allowfullscreen="true"
      mozallowfullscreen="true"
      webkitallowfullscreen="true"
    ></iframe>
  ```
6. Copy the "Your-Google-Slide-Embed-Link" part and navigate to Decipad.
7. Use the /embed command, paste your embed link, and press "Insert."

### Pitch

To embed slides from Pitch into Decipad, follow these steps:

1. Open your Pitch presentation.
2. Click the "Share" button at the top right.
3. Select "Share with anyone" and ensure that "Public access" is enabled.
4. Copy the provided link and use the /embed command, paste your embed link, and click "Insert."

### Loom

To embed videos from Loom into Decipad, follow these steps:

1. Open the Loom video you want to embed.
2. Click the "Share" option in the top right corner.
3. In the sharing modal that appears, select the "Embed" tab.
4. Copy the provided embed code that looks like this:
   ```
   <div style="position: relative; padding-bottom: 56.74%; height: 0;">
     <iframe
       src="Your-Loom-Embed-Link"
       frameborder="0"
       allowfullscreen
       style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
     ></iframe>
   </div>
   ```
5. Extract the "Your-Loom-Embed-Link" part and go to Decipad.
6. Use the /embed command and paste your embed link. Then, press "Insert."

### YouTube

To embed YouTube videos, simply copy the video link and paste it directly into Decipad. A new block with your video will be added to your notebook.

## Request Other Apps

Don't see an app you want to embed? Please reach out to [support@decipad.com](mailto:support@decipad.com) or use the Help Button at the bottom of your Decipad app to share your request, and our team will try to accommodate.
