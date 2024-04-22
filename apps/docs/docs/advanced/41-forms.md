---
pagination_next: null
title: Submit Forms
---

import AutoplayLoopVideo from '@site/src/components/AutoplayLoopVideo/AutoplayLoopVideo';
import YouTubePlayer from '@site/src/components/VideoCards/videos';

# Submit Form Block (Team Plan Feature)

Effortlessly capture leads and their scenarios from your notebook using Decipad's submit button. This feature gathers data from input widgets like sliders and collects user emails, forwarding all information to any webhook of your choice.

This feature is only available on the Team plan.
For more information on each plan, please visit our [pricing page](https://www.decipad.com/pricing).

## How Decipad's Submit Button Works

 <YouTubePlayer videoId="SNJqHiV2oD4" thumbnailUrl="/docs/img/thumbnails/thumbnail-forms.png" />

### Getting Started

1. **Create Your Notebook**: Begin by creating your notebook and adding all the necessary inputs you wish to collect. Utilize [widgets](/quick-start/widgets) to make your notebook interactive for readers.

2. **Add the Submit Form Block**: To enable data collection, insert the Submit Form Block. Simply type `/` on an empty paragraph, search for "Submit Form," and click to insert it.

3. **Get Your Submission URL (Webhook)**: Before sharing your notebook, configure the Submit Form Block with a Webhook URL where the notebook data will be sent. [See an example setup using Zapier to send data to a Google Sheet below](/advanced/forms/#example-integration-with-zapier-and-google-sheets).

4. **Add Webhook**: Click the plus `+` button on your "Submit Form Block" to open the "Integration Settings" panel. Create a new secret and paste the Webhook URL into the provided field.

5. **Connect Your Submit Form Block**: Return to your notebook and configure the submit button by selecting the connection you've just established using the "Select Your Target URL" picker.

6. **Publish Your Notebook**: Now you can [publish and share your notebook](/share/publish). When someone uses the `Submit Form Block`, all the notebook data with their emails will be sent to your webhook.

### Example: Integration with Zapier and Google Sheets

1. **Create a New Zap**:

   - Navigate to Zapier and create a new Zap.
   - Choose "Webhooks" as the trigger and select the "Catch Hook" event.

2. **Obtaining the Webhook URL**:

   - After setting up the trigger, get the Webhook URL provided by Zapier.
   - Copy this URL as it will be used in the Submit Form Block.

3. **Adding Webhook URL to Decipad Secrets**:

   - In your Decipad notebook, click the plus icon and add a new secret named "Zapier-Catch Hook."
   - Paste the Webhook URL into the provided field.

4. **Setting up Google Sheets Action**:

   - In the Zapier Zap editor, add a Google Sheets action.
   - Choose "Create Spreadsheet Row" as the event.
   - Choose the spreadsheet and worksheet where the form data will be inserted.

5. **Mapping Data Fields**:

   - Submit your Decipad form so all fields show up on your Zap editor.
   - Map the Decipad input fields to the corresponding columns in the spreadsheet.

6. **Test Your Setup**:

   - Test the Zap by manually triggering it and verifying that data is correctly inserted into the Google Sheets.

7. **Publishing the Zap**:

   - Once satisfied with the test results, publish the Zap to make it live.

8. **Publishing Your Notebook**:
   - [Make your notebook public](/share/publish) and share its URL to start collecting data.
