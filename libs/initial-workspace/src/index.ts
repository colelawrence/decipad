import type { Document } from '@decipad/editor-types';
import { once } from '@decipad/utils';
import welcomeNotebook from './notebooks/welcomeNotebook.json';
import tutorialNotebook from './notebooks/tutorialNotebook.json';
import businessNotebook from './notebooks/businessNotebook.json';
import veryWeirdLoadingWhenEditing from './notebooks/veryWeirdLoadingWhenEditing.json';
import everything from './notebooks/everything.json';
import appleModel from './notebooks/apple-model.json';
import investorUpdate from './notebooks/investor-update-example.json';
import offerLetter from './notebooks/offer-letter.json';
import performanceSummary from './notebooks/performance-summary-letter.json';
import salesPipeline from './notebooks/sales-pipeline.json';
import seedFounders from './notebooks/seed-founders.json';
import shilling from './notebooks/shilling.json';
import sprintCapacity from './notebooks/sprint-capacity.json';
import stockOptionsStartup from './notebooks/stock-options-startup.json';

export interface Notebook {
  title: string;
  icon?: string;
  status?: string;
  content: Document;
}

export interface Section {
  name: string;
  color: string;
}
export interface InitialWorkspace {
  notebooks: Array<Notebook>;
  sections: Array<Section>;
}

const isTesting = once(() => !!process.env.JEST_WORKER_ID || !!process.env.CI);
// eslint-disable-next-line no-underscore-dangle
const isLocalDev = once(() => {
  const url = process.env.DECI_APP_URL_BASE;
  return (
    url == null ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://127.0.0.1')
  );
});
const shouldCreateDevNotebooks = once(() => !isTesting() && isLocalDev());

const devOnlyNotebooks = (): InitialWorkspace['notebooks'] => [
  {
    title: 'Very weird loading when editing',
    content: veryWeirdLoadingWhenEditing as Document,
    icon: 'World-Sulu',
    status: 'draft',
  },
  {
    title: 'Everything, everywhere, all at once',
    content: everything as Document,
    icon: 'TableSmall-Sun',
    status: 'draft',
  },
  {
    title: '[Template] How much is Apple worth? Breaking down a DCF model.',
    content: appleModel as Document,
    icon: 'AnnotationWarning-Grapefruit',
    status: 'draft',
  },
  {
    title: '[Template] Decipad Investor Update: Mar 2023',
    content: investorUpdate as Document,
    icon: 'Frame-Rose',
    status: 'draft',
  },
  {
    title: '[Template] Offer Letter',
    content: offerLetter as Document,
    icon: 'Paperclip-Perfume',
    status: 'draft',
  },
  {
    title: '[Template] Performance summary letter',
    content: performanceSummary as Document,
    icon: 'Wallet-Malibu',
    status: 'draft',
  },
  {
    title: '[Template] Sales Report: Monthly Pipeline Update',
    content: salesPipeline as Document,
    icon: 'Star-Sulu',
    status: 'draft',
  },
  {
    title: '[Template] Capitalisation table for seed founders',
    content: seedFounders as Document,
    icon: 'Crown-Sun',
    status: 'draft',
  },
  {
    title:
      '[Template] Shilling Founders Fund | An innovative approach to profit sharing',
    content: shilling as Document,
    icon: 'Battery-Grapefruit',
    status: 'draft',
  },
  {
    title: '[Template] Sprint Capacity Calculation for Scrum Teams',
    content: sprintCapacity as Document,
    icon: 'Happy-Rose',
    status: 'draft',
  },
  {
    title: '[Template] Understanding stock options at an early stage startup',
    content: stockOptionsStartup as Document,
    icon: 'Key-Perfume',
    status: 'draft',
  },
];

export const initialWorkspace = (): InitialWorkspace => ({
  sections: [
    {
      name: 'Personal',
      color: '#c1c7f8',
    },
  ],
  notebooks: [
    {
      title: 'Weekend Trip - Example Notebook',
      content: tutorialNotebook as Document,
      icon: 'Beach-Sulu',
      status: 'draft',
    },
    {
      title: 'Starting a Business - Example Notebook',
      content: businessNotebook as Document,
      icon: 'Wallet-Perfume',
      status: 'draft',
    },
    {
      title: 'Welcome to Decipad!',
      content: welcomeNotebook as Document,
      icon: 'Message-Sun',
      status: 'draft',
    },
    ...(shouldCreateDevNotebooks() ? devOnlyNotebooks() : []),
  ],
});
