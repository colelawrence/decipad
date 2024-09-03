---
sidebar_position: 0
---

# Notebooks

Decipad Notebooks combine numbers and narrative to share insights on data. <br />
Create a new notebook by clicking `+ New Notebook` on the top right of your [workspace](http://app.decipad.com/).

import YouTubePlayer from '@site/src/components/VideoCards/videos';
import AutoplayLoopVideo from '@site/src/components/AutoplayLoopVideo/AutoplayLoopVideo';

<YouTubePlayer videoId="HgonzbhFWLA" thumbnailUrl="/docs/img/thumbnails/thumbnail-welcome.png" />

## Notebook Features

---

import {
newNotebookBadge,
GridContainer,
Card,
} from '@site/src/components/GalleryCards';

<GridContainer>
  <Card title="Formulas" notebook="/docs/quick-start/formulas" description="Create quick calculations people can follow." />

  <Card title="Tables" notebook="/docs/quick-start/tables" description="Organize data and create quick calculations." />

  <Card title="Charts" notebook="/docs/quick-start/charts" description="Create quick visualizations for your data." />

  <Card title="Data Views" notebook="/docs/quick-start/data-views" description="Pivot your data to quickly highlight information." />

  <Card title="Interactive Widgets" notebook="/docs/quick-start/widgets" description="Explore data in real-time and create interactive notebooks." />

  <Card title="Inline Results" notebook="/docs/quick-start/inline-results" description="Explain results and conclusions." />

  <Card title="Data Integrations" notebook="/docs/integrations/code" description="Quickly import data to analyze and visualize." />

  <Card title="Embed on Decipad" notebook="/docs/quick-start/embed-on-decipad" description="Embed from external websites into Decipad." />
</GridContainer>

## Notebook Blocks

---

On Decipad everything is a block, that you can combine to present and analyze your data.

1. **Add New Blocks**:
   To add a new block, click the + button located next to an empty line. Alternatively, use the keyboard shortcut by typing `/` on a new empty line. Select the desired block from the menu that appears.

2. **Delete Blocks**:
   To delete a block, hover over the block and click the `⸬` button that appears on its left. Choose `Delete` from the options.

3. **Move Blocks**:
   To move a block, hold the `⸬` button that appears on the left of the block, and drag the block to the desired position indicated by a blue line. You can stack side-by-side widgets, paragraphs, callouts, quotes, and images.

4. **Duplicate Blocks**:
   To duplicate a block, hover over the block and click the `⸬` button that appears, then select `Duplicate`.

5. **Hide Blocks from Notebook Readers**:
   To hide a block from readers, select "Hide from reader". This will hide the block for collaborators with the "Reader" role, the pulished view, and when the document is embedded. The block will fade, and a hidden icon will appear on the left of the block.

6. **Transform Blocks**:
   To transform a block, hover over the block and click the `⸬` button that appears. Select "Turn into" to change the type of your block.

## Notebook Layouts

---

<AutoplayLoopVideo
  src="https://decipad-docs.s3.eu-west-2.amazonaws.com/videos/layouts.mov"
  playbackSpeed={1}
/>

Make your notebooks easier to read and navigate, place different types of blocks side by side and adjust their layout. Here’s how to create custom layouts:

1. **Add columns:** 
   Drag a widget or text block next to another until a vertical line appears. Note that tables, embeds, and sketches cannot be arranged into columns. Alternatively, you can type `/layout` in an empty paragraph, select `Layout` from the menu, and choose a multi-column layout to start adding content.

2. **Adjust columns sizes:**
   To adjust the columns sizes on your layout use the vertical spacers in between each column.

3. **Make blocks and layouts full-width:**

- **For paragraphs:** Click the `⸬` button on the left of the block, then select `Full width`.
- **For layouts:** Hover over the layout stack and click the two-arrow icon next to the comment button.

## Notebook Tabs

---

<YouTubePlayer videoId="LtMIT095exc" thumbnailUrl="/docs/img/thumbnails/thumbnail-tabs.png" />

<br />

Organize your notebook blocks into separate tabs.

1. **Add Tabs:**
   Click the `Add tab` button at the bottom of your notebooks. Choose a new name for your tab and press enter to confirm. To delete a tab, select it, click the dropdown next to its name, and choose `Delete tab`. To update the tab's icon, click on it and choose a new one. You can also reorder your tabs using `Move tab` in the dropdown menu.

2. **Move Blocks Between Tabs:**
   Select the block or blocks you want to move. Click the `⸬` button that appears on the left of the block selection. Choose `Move to tab` and select the new tab.

3. **Hide Tabs from Notebooks Readers**
   Select the tab you want to hide. Click the dropdown next to its name. Choose `Hide from readers`. This will hide the tab for collaborators with the "Reader" role, the published view, and when the document is embedded.

## Notebook Sidebar

---

Quickly add notebook blocks or inspect all notebook data using the notebook sidebar.

1. **Open the Sidebar:**
   Click the `Sidebar` button in the topbar of your notebook to toggle the sidebar open or closed.

2. **Insert Tab:**
   Navigate to the `Insert` tab in the sidebar to view and search for all available blocks. Click on a block to quickly add it to your notebook.

3. **Data Tab:**
   Navigate to the `Data` tab in the sidebar to view and search all notebook variables. Use the `+ New Variable` button to create calculations that are stored only in the sidebar, helping you keep your notebook organized.

## Notebook Data Drawer

---

Quickly edit all variables or create new ones that are stored only in the sidebar.

1. **Create Sidebar Variables:**
   To add reusable variables to the notebook sidebar, open the sidebar by clicking the `Sidebar` button in the topbar and navigate to the `Data` tab. Click `+ New Variable` to create a new calculation. The data drawer will open, allowing you to name the variable and edit its formula.

2. **Edit Notebook Variables:**
   To edit an existing variable, open the sidebar and go to the `Data` tab. Search for the variable you want to modify and click on it. The data drawer will open, where you can update the variable’s name, adjust its formula, or delete it entirely from the notebook.

3. **Delete Notebook Variables:**
   To delete a variable, open the sidebar and go to the `Data` tab. Select the variable you want to remove and press `Delete` (Windows) or `Backspace` (Mac).

4. **Edit Inline Results:**
   To edit inline results embedded in your notebook, simply click on the result. The data drawer will open, allowing you to edit any variable that appears as an inline result in the notebook.

## Notebook Images

---

1. To add images to your notebook, simply type `/image` in an empty paragraph and select `Image` from the menu that appears. This will open the image uploader.

2. From there, you have several options:
   - Upload an image directly from your computer.
   - Paste a link to an image from the web.
   - Select GIFs from Giphy, Unsplash images, or generate AI images.
