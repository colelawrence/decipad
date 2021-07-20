import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_PARAGRAPH,
} from '@udecode/slate-plugins';
import React from 'react';
import { NoDocSyncEditor } from './NoDocSyncEditor.component';

export default {
  title: 'Editor/Examples',
  component: NoDocSyncEditor,
};

export const Default = () => (
  <div style={{ maxWidth: '1140px', margin: '25px auto' }}>
    <NoDocSyncEditor
      initialValue={[
        { type: ELEMENT_H1, children: [{ text: 'Funding needs' }] },
        {
          type: ELEMENT_PARAGRAPH,
          children: [
            {
              text: `This notebook calculates how much funding your startup needs. Assuming your expenses are constant and your revenue is growing, it shows when you'll reach profitability and how much capital you'll burn through before then. Once you're profitable, you control your destiny: you can raise more to grow faster if you want.`,
            },
          ],
        },
        {
          type: ELEMENT_H2,
          children: [{ text: `Business actuals` }],
        },
        {
          type: ELEMENT_PARAGRAPH,
          children: [
            {
              text: `To understand our funding needs we need to know our current level of spending and our starting point in terms of revenue.`,
            },
          ],
        },
        {
          type: ELEMENT_CODE_BLOCK,
          children: [
            {
              text: 'Monthly expenses = 130,000 £\nInitial Monthly Revenue = 2500 £',
            },
          ],
        },
        {
          type: ELEMENT_H2,
          children: [
            {
              text: 'Business assumptions',
            },
          ],
        },
        {
          type: ELEMENT_PARAGRAPH,
          children: [
            {
              text: `We also have to set our target growth rate. Don't be too over realistic here. You don't want to fall short of expectations otherwise you'll need additional funding until break-even.`,
            },
          ],
        },
        {
          type: ELEMENT_CODE_BLOCK,
          children: [
            {
              text: `Monthly Revenue Growth Rate = 5 £`,
            },
          ],
        },
        {
          type: ELEMENT_H2,
          children: [{ text: `Capital needed & time to profitability` }],
        },
        {
          type: ELEMENT_PARAGRAPH,
          children: [
            {
              text: 'So we have set our monthly expenses, our starting monthly revenue and our assumption for the target growth rate. Now we are ready to create a model which outputs the level of funding we need and the time it will take to burn that cash and reach profitability.',
            },
          ],
        },
        {
          type: ELEMENT_CODE_BLOCK,
          children: [
            {
              text: `Time to profitability = ln(Monthly expenses / Initial Monthly Revenue) / \nln(1 + Monthly Revenue Growth Rate) in months`,
            },
          ],
        },
      ]}
    />
  </div>
);

Default.storyName = 'No Doc Sync';
