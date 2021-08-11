import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate';
import { v4 } from 'uuid';
import { NoDocSyncEditor } from './NoDocSyncEditor.component';

export default {
  title: 'Editor/Examples',
  component: NoDocSyncEditor,
};

export const Normal = () => (
  <div style={{ maxWidth: '1140px', margin: '25px auto' }}>
    <NoDocSyncEditor
      initialValue={[
        {
          type: ELEMENT_H1,
          id: v4(),
          children: [{ text: 'Funding needs' }],
        },
        {
          type: ELEMENT_BLOCKQUOTE,
          id: v4(),
          children: [
            {
              text: `This notebook calculates how much funding your startup needs. Assuming your expenses are constant and your revenue is growing, it shows when you'll reach profitability and how much capital you'll burn through before then. Once you're profitable, you control your destiny: you can raise more to grow faster if you want.`,
            },
          ],
        },
        {
          type: ELEMENT_H2,
          id: v4(),
          children: [{ text: `Business actuals` }],
        },
        {
          type: ELEMENT_PARAGRAPH,
          id: v4(),
          children: [
            {
              text: `To understand our funding needs we need to know our current level of spending and our starting point in terms of revenue.`,
            },
          ],
        },
        {
          type: ELEMENT_CODE_BLOCK,
          id: v4(),
          children: [
            {
              type: ELEMENT_CODE_LINE,
              id: v4(),
              children: [
                {
                  text: 'Monthly_expenses = 130,000 £',
                },
              ],
            },
            {
              type: ELEMENT_CODE_LINE,
              id: v4(),
              children: [
                {
                  text: 'Initial_Monthly_Revenue = 2500 £',
                },
              ],
            },
          ],
        },
        {
          type: ELEMENT_H2,
          id: v4(),
          children: [
            {
              text: 'Business assumptions',
            },
          ],
        },
        {
          type: ELEMENT_PARAGRAPH,
          id: v4(),
          children: [
            {
              text: `We also have to set our target growth rate. Don't be too over realistic here. You don't want to fall short of expectations otherwise you'll need additional funding until break-even.`,
            },
          ],
        },
        {
          type: ELEMENT_CODE_BLOCK,
          id: v4(),
          children: [
            {
              id: v4(),
              type: ELEMENT_CODE_LINE,
              children: [
                {
                  text: `Monthly_Revenue_Growth_Rate = 5 £`,
                },
              ],
            },
          ],
        },
        {
          type: ELEMENT_H2,
          id: v4(),
          children: [{ text: `Capital needed & time to profitability` }],
        },
        {
          type: ELEMENT_PARAGRAPH,
          id: v4(),
          children: [
            {
              text: 'So we have set our monthly expenses, our starting monthly revenue and our assumption for the target growth rate. Now we are ready to create a model which outputs the level of funding we need and the time it will take to burn that cash and reach profitability.',
            },
          ],
        },
        {
          type: ELEMENT_CODE_BLOCK,
          id: v4(),
          children: [
            {
              id: v4(),
              type: ELEMENT_CODE_LINE,
              children: [
                {
                  text: 'Time_to_profitability = ln(Monthly_expenses / Initial_Monthly_Revenue) /',
                },
              ],
            },
            {
              id: v4(),
              type: ELEMENT_CODE_LINE,
              children: [
                {
                  text: 'ln(1 + Monthly_Revenue_Growth_Rate) in months',
                },
              ],
            },
          ],
        },
      ]}
    />
  </div>
);

Normal.storyName = 'No Doc Sync';
