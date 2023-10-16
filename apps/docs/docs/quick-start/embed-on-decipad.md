---
sidebar_position: 22
hide_table_of_contents: false
---

# Embed on Decipad

Easily embed slides, videos, or other content from external websites into Decipad.

## Embed from Loom

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

## Embed from Youtube

To embed YouTube videos, simply copy the video link and paste it directly into Decipad.

## Embed from Google Slides

To embed slides from Google Slided into Decipad, follow these steps:

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

## Embed from Pitch

To embed slides from Pitch into Decipad, follow these steps:

1. Open your Pitch presentation.
2. Click the "Share" button at the top right.
3. Select "Embed presentation" and ensure that "Public access" is enabled.
4. You will be provided with an embed code that looks like this:
   ```
   <iframe
    src="Your-Pitch-Slide-Embed-Link"
    allow="fullscreen"
    allowfullscreen=""
    width="560"
    height="368"
    style="border:0"
   ></iframe>
   ```
5. Copy the "Your-Pitch-Slide-Embed-Link" part and proceed to Decipad.
6. Use the /embed command, paste your embed link, and click "Insert."
