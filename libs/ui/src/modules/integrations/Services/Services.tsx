/* eslint decipad/css-prop-named-variable: 0 */
import {
  ExternalDataSourceFragmentFragment,
  ExternalProvider,
  useCreateExternalDataSourceMutation,
  useDeleteExternalDataMutation,
  useGetExternalDataSourcesWorkspaceQuery,
} from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import { nanoid } from 'nanoid';
import { FC, ReactNode, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRouteParams } from 'typesafe-routes/react-router';
import {
  IntegrationActionItem,
  IntegrationItem,
} from '../IntegrationItem/IntegrationItem';
import { useClientEvents } from '@decipad/client-events';
import {
  ThumbnailGoogleSheet,
  ThumbnailNotion,
} from '../../../icons/thumbnail-icons';
import { TEMP_CONNECTION_NAME } from '@decipad/frontend-config';
import * as Styled from './styles';

interface ServicesProps {
  readonly workspaceId: string;
}

function OnAuth(externalData: ExternalDataSourceFragmentFragment) {
  window.location.replace(
    `${window.location.origin}/api/externaldatasources/${externalData.id}/auth`
  );
}

const IconMap: Partial<Record<ExternalProvider, ReactNode>> = {
  notion: <ThumbnailNotion />,
  gsheets: <ThumbnailGoogleSheet />,
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

  const [{ data }] = useGetExternalDataSourcesWorkspaceQuery({
    variables: { workspaceId },
  });

  const [, removeExternalData] = useDeleteExternalDataMutation();

  const filteredDataSources =
    data?.getExternalDataSourcesWorkspace.filter(
      (e) => e.provider === 'notion' || e.provider === 'gsheets'
    ) ?? [];

  const { connected } = useRouteParams(
    workspaces({}).workspace({ workspaceId }).connections({}).integrations
  );

  const toast = useToast();
  const track = useClientEvents();

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
    <Styled.Wrapper>
      <Styled.Title>Connect services</Styled.Title>
      <IntegrationItem
        icon={<ThumbnailNotion />}
        title="Notion"
        description="Work with Notion Databases at the speed of thought!"
        variant="modal"
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
      <IntegrationItem
        icon={<ThumbnailGoogleSheet />}
        title="Google Sheets"
        description="Effortlessly use your spreadsheet inside Decipad!"
        variant="modal"
        onClick={() => {
          OnConnectIntegration('gsheets');
        }}
      />
      {filteredDataSources.length > 0 && (
        <>
          <Styled.Title>Existing connections</Styled.Title>
          {filteredDataSources.map((externalDataSource) => (
            <IntegrationActionItem
              icon={IconMap[externalDataSource.provider]}
              title={externalDataSource.name}
              description={''}
              variant="modal"
              onClick={() => {}}
              onEdit={() => {
                OnAuth(externalDataSource);
              }}
              onDelete={() => {
                removeExternalData({
                  id: externalDataSource.id,
                  workspaceId,
                });
              }}
            />
          ))}
        </>
      )}
    </Styled.Wrapper>
  );
};
