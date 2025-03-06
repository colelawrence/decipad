import { z } from 'zod';
import { DataSource } from '../../types';
import hubspotConnection from './hubspot/hubspotConnection.json';
import harvestConnection from './harvest/harvestConnection.json';
import xeroConnection from './xero/xeroConnection.json';
import { once } from '@decipad/utils';

const sourceConnectionParser = once(() =>
  z.object({
    scheduleType: z.string(),
    scheduleData: z.object({
      basicSchedule: z.object({
        units: z.number(),
        timeUnit: z.string(),
      }),
    }),
    namespaceDefinition: z.string(),
    prefix: z.string(),
    nonBreakingChangesPreference: z.string(),
    geography: z.string(),
    syncCatalog: z.object({
      streams: z.array(
        z.object({
          stream: z.object({
            name: z.string(),
            jsonSchema: z.object({
              $schema: z.string().optional(),
              type: z.union([z.array(z.string()), z.string()]),
              properties: z.record(z.any()),
            }),
          }),
          supportedSyncModes: z.array(z.string()).optional(),
          sourceDefinedCursor: z.boolean().optional(),
          defaultCursorField: z.array(z.string()).optional(),
          sourceDefinedPrimaryKey: z.array(z.array(z.string())).optional(),
          isResumable: z.boolean().optional(),
          config: z.object({
            syncMode: z.string(),
            cursorField: z.array(z.string()),
            destinationSyncMode: z.string(),
            primaryKey: z.array(z.array(z.string())),
            aliasName: z.string(),
            selected: z.boolean(),
            suggested: z.boolean(),
            selectedFields: z.array(z.any()),
            hashedFields: z.array(z.any()).optional(),
            mappers: z.array(z.any()),
          }),
        })
      ),
    }),
  })
);

export type SourceConnectionDefinition = z.infer<
  ReturnType<typeof sourceConnectionParser>
>;

const sourceDefs: Record<DataSource, unknown> = {
  hubspot: hubspotConnection,
  harvest: harvestConnection,
  xero: xeroConnection,
};

export const getConnectionDef = (
  sourceType: DataSource
): SourceConnectionDefinition =>
  sourceConnectionParser().parse(sourceDefs[sourceType]);
