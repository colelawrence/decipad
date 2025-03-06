import { z } from 'zod';
import { DataSource } from '../../types';
import hubspotSource from './hubspot/hubspotSource.json';
import harvestSource from './harvest/harvestSource.json';
import xeroSource from './xero/xeroSource.json';
import { once } from '@decipad/utils';

const sourceDefParser = once(() =>
  z.object({
    sourceType: z.string(),
    realm: z.string(),
    displayName: z.string(),
    description: z.string(),
    icon: z.string(),
    configInstructionsMarkdown: z.string(),
    configSchema: z.object({
      type: z.enum(['object']),
      properties: z.record(z.string(), z.any()),
    }),
  })
);

export type ExtractSourceDefinition = z.infer<
  ReturnType<typeof sourceDefParser>
>;

const sourceDefs: Record<DataSource, unknown> = {
  hubspot: hubspotSource,
  harvest: harvestSource,
  xero: xeroSource,
};

export const getExtractSourceDef = (
  sourceType: DataSource
): ExtractSourceDefinition => sourceDefParser().parse(sourceDefs[sourceType]);
