---
sidebar_position: 0
---

# Notebooks

Decipad Notebooks combine numbers and narrative to share insights on data.

import YouTubePlayer from '@site/src/components/VideoCards/videos';
import ImageAnnotation from '@site/src/components/ImageAnnotation/ImageAnnotation';
import NewNotebook from './img/NewNotebook.png';
import NewNotebook1 from './img/NewNotebook1.png';
import AddBlocks from './img/AddBlocks.png';
import BlockOptions from './img/BlockOptions.png';
import MoveBlock from './img/MoveBlock.png';
import NotebookOptions from './img/NotebookOptions.png';

<YouTubePlayer videoId="R-RgJ2F8PSY" thumbnailUrl="/docs/img/thumbnails/thumbnail-first-notebook.png"/>

## Notebook Features

import {
newNotebookBadge,
GridContainer,
Card,
} from '@site/src/components/GalleryCards';

<GridContainer>
              <Card
                title="Formulas"
                notebook="/docs/quick-start/formulas"
                description="Create quick calculations people can follow."
              />
              <Card
                title="Tables"
                notebook="/docs/quick-start/tables"
                description="Organize data and create quick calculations."
              />
              <Card
                title="Charts"
                notebook="/docs/quick-start/charts"
                description="Create quick visualizations for your data."
              />
              <Card
                title="Data Views"
                notebook="/docs/quick-start/data-views"
                description="Pivot your data to quickly highlight information."
              />
              <Card
                title="Interactive Widgets"
                notebook="/docs/quick-start/widgets"
                description="Explore data in real-time and create interactive notebooks."
              />
              <Card
                title="Inline Results"
                notebook="/docs/quick-start/inline-results"
                description="Explain results and conclusions."
              />
             <Card
                title="Data Integrations"
                notebook="/docs/integrations/basics"
                description="Quickly import data to analyze and visualize."
              />
            </GridContainer>

<!--
1. **Add Formulas**: You can use formulas to perform calculations on data, such as adding or multiplying numbers together. Formulas are useful for displaying information in a clear and organized way.

2. **Add Tables**: Tables help you organize data, making it easier to read and understand. You can also use tables to perform calculations using formulas.

3. **Add Charts**: Charts are visual representations of data that can help you understand trends or patterns in the data. You can add charts to display table data in a way that is easy to read and interpret.

4. **Add Data Views**: Data Views allow you to group and pivot your table data in various ways. This feature is particularly useful when dealing with large data sets, as it allows you to quickly identify the information that is most relevant to your analysis.

5. **Drag Numbers Inline to Explain**: You can drag numbers into your text to provide additional context or explanation about how they are used in the formulas. This helps to make your explanations more clear and understandable.

6. **Add Interactive Widgets**: Interactive widgets are elements within the notebook that allow you to input or change data in real-time. You can use these widgets to create interactive notebooks or explore scenarios.

7. **Import Data**: You can easily import data into your notebook from various sources, including CSV and Google Sheets. This allows you to quickly analyze and visualize data without having to manually enter it into your notebook.

-->

<br/>

## Create a New Notebook

---

<ImageAnnotation
alt="Custom Formula Example"
isOnlyOnHover
firstSelectedByDefault
steps={[
{
src: NewNotebook,
xPercent: 83,
yPercent: 1,
widthPercent: 14,
heightPercent: 6.5,
value: "1",
description: `<b>To create a new notebook</b>, click <code>+ New Notebook</code> on the top right of your workspace.`,
},
{
src: NewNotebook1,
xPercent: 78,
yPercent: 82,
widthPercent: 18,
heightPercent: 15,
value: "2",
description: `Once you are in the new notebook, click on <code>Clear All</code> at the bottom right corner to begin with an <b>empty notebook.</b>`,
},
]}
/>

<br/>

## Manage Notebooks

---

<ImageAnnotation
alt="Custom Formula Example"
isOnlyOnHover
firstSelectedByDefault
navigationButtons
steps={[
{
src: NotebookOptions,
xPercent: 28,
yPercent: 46.5,
widthPercent: 69,
heightPercent: 8,
value: 1,
description: `On your workspace, hover a notebook.`,
},
{
src: NotebookOptions,
xPercent: 89,
yPercent: 46.5,
widthPercent: 8,
heightPercent: 8,
value: 2,
description: `Click the <code>•••</code> button on the right to open up the option's menu.`,
},
{
src: NotebookOptions,
xPercent: 75,
yPercent: 54,
widthPercent: 21,
heightPercent: 6.5,
value: 3,
description: `<b>Duplicate Notebook</b>`,
},
{
src: NotebookOptions,
xPercent: 75,
yPercent: 58.5,
widthPercent: 21,
heightPercent: 6.5,
value: 4,
description: `<b>Move Notebook</b> to a different workspace.`,
},
{
src: NotebookOptions,
xPercent: 75,
yPercent: 63.5,
widthPercent: 21,
heightPercent: 6.5,
value: 5,
description: `<b>Download a Notebook copy</b>. To import a notebook, drag the <code>.zip</code> file into any Decipad workspace.`,
},
{
src: NotebookOptions,
xPercent: 75,
yPercent: 68,
widthPercent: 21,
heightPercent: 6.5,
value: 6,
description: `<b>Download Notebook backups</b>. To import a backup, drag the <code>.zip</code> file into any Decipad workspace.`,
},
{
src: NotebookOptions,
xPercent: 75,
yPercent: 73,
widthPercent: 21,
heightPercent: 6.5,
value: 7,
description: `<b>Archive Notebook</b>`,
},
]}
/>

<br/>

## Notebook Blocks

---

On Decipad everything is a block, that you can combine to present and analyze your data.

### Add New Blocks

<ImageAnnotation
alt="Custom Formula Example"
isOnlyOnHover
firstSelectedByDefault
navigationButtons
steps={[
{
src: AddBlocks,
xPercent: 16,
yPercent: 38,
widthPercent: 17,
heightPercent: 6.5,
value: "1",
description: `Click the <code>+</code> button located next to an empty line.<br/> Alternatively, use the keyboard shortcut by typing <code>/</code> on a new empty line.`,
},
{
src: AddBlocks,
xPercent: 20,
yPercent: 46.5,
widthPercent: 30,
heightPercent: 10,
value: "2",
description: `Select the desired block from the menu that appears.`,
},
]}
/>

### Move Blocks

<ImageAnnotation
alt="Custom Formula Example"
isOnlyOnHover
firstSelectedByDefault
steps={[
{
src: MoveBlock,
xPercent: 16,
yPercent: 38,
widthPercent: 60,
heightPercent: 8,
value: 1,
description: `Hover any block you want to move.`,
},
{
src: MoveBlock,
xPercent: 18,
yPercent: 38,
widthPercent: 6.5,
heightPercent: 6.5,
value: 2,
description: `Hold the <code>⸬</code> button that appears on the left of the block.`,
},
{
src: MoveBlock,
xPercent: 20,
yPercent: 55,
widthPercent: 60,
heightPercent: 12,
value: 3,
description: `Drag the block to the desired position indicated by a blue line.<br/>You can stack side-by-side widgets, paragraphs, callouts, quotes, and images.`,
},
{
src: MoveBlock,
xPercent: 20,
yPercent: 55,
widthPercent: 60,
heightPercent: 12,
value: 4,
description: `Release the <code>⸬</code> button to place the block in its new position.`,
},
]}
/>

### Block Options

<ImageAnnotation
alt="Custom Formula Example"
isOnlyOnHover
firstSelectedByDefault
navigationButtons
steps={[
{
src:BlockOptions,
xPercent: 18,
yPercent: 38,
widthPercent: 58,
heightPercent: 9,
value: 1,
description: `Hover any block.`,
},
{
src:BlockOptions,
xPercent: 18,
yPercent: 38,
widthPercent: 6.5,
heightPercent: 6.5,
value: 2,
description: `Click the <code>⸬</code> button that appears on the left of the block to open the options menu.`,
},
{
src:BlockOptions,
xPercent: 5,
yPercent: 39,
widthPercent:17,
heightPercent: 6.5,
value: 3,
description: `<b>Hide a block</b><br/> Select <code>Hide from reader</code> to hide any block from a published notebook.<br/>The block will fade, and a hidden icon will appear on the left of the block.`,
},
{
src:BlockOptions,
xPercent: 5,
yPercent: 43.5,
widthPercent:17,
heightPercent: 6.5,
value: 4,
description: `<b>Duplicate a block</b>`,
},
{
src:BlockOptions,
xPercent: 5,
yPercent: 48.5,
widthPercent:17,
heightPercent: 6.5,
value: 5,
description: `<b>Transform a block</b><br/>Select <code>Turn into</code> to transform the type of your block.`,
},
{
src:BlockOptions,
xPercent: 5,
yPercent: 55.5,
widthPercent:17,
heightPercent: 6.5,
value: 6,
description: `<b>Delete a block</b>`,
},
]}
/>

## Upload Files

<ImageAnnotation
noImage
alt="Custom Formula Example"
steps={[
{
value: "1",
description: `<b>Upload .CSV files</b>: Drag and drop your .CSV files directly into a notebook or use the slash command "/csv" on an empty paragraph.`,
},
{
value: "2",
description: `<b>Upload images</b>: Add visual elements and context to your notebooks by dragging and dropping image files or using the slash command "/image" on an empty paragraph.`,
}
]}
/>

<!--


## Notebook Blocks

On Decipad everything is a block, that you can combine to present and analyze your data.

**Add a Block**:

1. Click the `+` button located next to an empty line.
2. Select the desired block from the menu that appears.
   - Alternatively, use the keyboard shortcut by typing `/` on a new empty line, writing the name of the block, and pressing `Enter` to add it to your notebook.

**Move a Block**:

1. Hover over the block you want to move.
2. Hold the `⸬` button that appears on the left of the block.
3. Drag the block to the desired position indicated by a blue line.
4. Release the `⸬` button to place the block in its new position.

**Delete a Block**:

1. Hover over the block you want to delete.
2. Click the `⸬` button that appears on the left of the block.
3. Select `Delete` from the options.

**Duplicate a Block**:

1. Hover over the block you want to duplicate.
2. Click the `⸬` button that appears on the left of the block.
3. Select `Duplicate` from the options.

**Stack Blocks Side-by-Side**

You can stack widgets, paragraphs, callouts, quotes, and images.

1. Hover over the block you want to stack.
2. Hold the `⸬` button that appears on the left of the block.
3. Drag the block to the desired position indicated by a blue line.
4. When you see a vertical line indicating alignment, release the block.

**Hide a Block from a Reader**

1. Hover over the block you want to hide.
2. Click the `⸬` button that appears on the left of the block.
3. Select `Hide from reader` from the options.
   - The block will fade, and a hidden icon will appear on the left of the block.



## Manage Notebooks

- **Duplicate your notebook**: Go to your workspace, hover over the notebook you want to duplicate, click the `•••` button on the right, and select `Duplicate`.

- **Archive a notebook**: Go to your workspace, hover over the notebook you want to archive, click the `•••` button on the right, and select `Archive`.

- **Delete a notebook**: Go to your workspace, click on the archived notebooks section, hover over the notebook you want to delete, click the `•••` button on the right, and select `Delete`.

- **Download a notebook**: Go to your workspace, hover over the notebook you want to export, click the `•••` button, and click `Download`. To import a notebook, drag the `.zip` file into any Decipad workspace.

- **Duplicate a notebook**: Make sure you're logged in. Go to the published notebook you want to duplicate, then click `Duplicate Notebook` on the top right. Find examples to duplicate in our [Gallery of examples](/gallery).

-->
