import {
  ExternalDataSourceFragmentFragment,
  ExternalProvider,
  useCreateExternalDataSourceMutation,
  useDeleteExternalDataMutation,
  useGetExternalDataSourcesWorkspaceQuery,
} from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import { css } from '@emotion/react';
import { p13Bold } from 'libs/ui/src/primitives';
import { nanoid } from 'nanoid';
import { FC, ReactNode, Suspense, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRouteParams } from 'typesafe-routes/react-router';
import { IntegrationActionItem, IntegrationItem } from './IntegrationStyles';
import { ClientEventsContext } from '@decipad/client-events';
import {
  ThumbnailGoogleSheet,
  ThumbnailNotion,
} from '../../icons/thumbnail-icons';
import { TEMP_CONNECTION_NAME } from '@decipad/frontend-config';
import { isFlagEnabled } from '@decipad/feature-flags';

const Wrapper = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '16px',
});

interface ServicesProps {
  readonly workspaceId: string;
}

const IconMap: Partial<Record<ExternalProvider, ReactNode>> = {
  notion: <ThumbnailNotion />,
  gsheets: <ThumbnailGoogleSheet />,
};

function OnAuth(externalData: ExternalDataSourceFragmentFragment) {
  window.location.replace(
    `${window.location.origin}/api/externaldatasources/${externalData.id}/auth`
  );
}

const ExistingServices: FC<ServicesProps> = ({ workspaceId }) => {
  const [{ data }] = useGetExternalDataSourcesWorkspaceQuery({
    variables: { workspaceId },
  });

  const [, removeExternalData] = useDeleteExternalDataMutation();

  const filteredDataSources =
    data?.getExternalDataSourcesWorkspace.filter(
      (e) => e.provider === 'notion' || e.provider === 'gsheets'
    ) ?? [];

  if (filteredDataSources.length === 0) {
    return null;
  }

  return (
    <>
      <p css={p13Bold}>Connected</p>
      {filteredDataSources.map((externalDataSource) => (
        <IntegrationActionItem
          icon={IconMap[externalDataSource.provider]}
          title={externalDataSource.name}
          description=""
          onClick={() => {}}
          onEdit={() => OnAuth(externalDataSource)}
          onDelete={() =>
            removeExternalData({ id: externalDataSource.id, workspaceId })
          }
        />
      ))}
    </>
  );
};

/**
 * Connect to various OAuth services
 *
 * So far:
 * - Notion
 */
export const Services: FC<ServicesProps> = ({ workspaceId }) => {
  const [, createDataSource] = useCreateExternalDataSourceMutation();
  const [, setQueryParams] = useSearchParams();

  const { connected } = useRouteParams(
    workspaces({}).workspace({ workspaceId }).connections({}).integrations
  );

  const toast = useToast();
  const track = useContext(ClientEventsContext);

  useEffect(() => {
    if (connected != null) {
      toast(`Successfully connected ${connected}`, 'success');
    }
  }, [connected, setQueryParams, toast]);

  async function OnConnectIntegration(provider: ExternalProvider) {
    const res = await createDataSource({
      dataSource: {
        externalId: nanoid(),
        workspaceId,
        provider,

        name: TEMP_CONNECTION_NAME,
      },
    });

    const externalData = res.data?.createExternalDataSource;

    if (externalData == null) {
      throw new Error('External data returned null');
    }

    OnAuth(externalData);
  }

  return (
    <div css={Wrapper}>
      <Suspense>
        <ExistingServices workspaceId={workspaceId} />
      </Suspense>

      <p css={p13Bold}>
        Effortlessly connect your Decipad workspace to any of these services.
      </p>
      <IntegrationItem
        icon={<ThumbnailNotion />}
        title="Notion"
        description="Work with Notion Databases at the speed of thought!"
        onClick={() => {
          track({
            segmentEvent: {
              type: 'action',
              action: 'Integration Set Up',
              props: {
                integration_type: 'notion',
                analytics_source: 'frontend',
              },
            },
          });
          OnConnectIntegration('notion');
        }}
      />
      {isFlagEnabled('GOOGLE_SHEET_INTEGRATION') && (
        <IntegrationItem
          icon={<ThumbnailGoogleSheet />}
          title="Google Sheets"
          description="Effortlessly use your spreadsheet inside Decipad!"
          onClick={() => {
            OnConnectIntegration('gsheets');
          }}
        />
      )}
    </div>
  );
};
