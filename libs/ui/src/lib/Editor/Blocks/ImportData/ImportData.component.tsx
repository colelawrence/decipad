import { InferError } from '@decipad/language';
import { useResult } from '@decipad/react-contexts';
import { getDefined } from '@decipad/utils';
import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { useContext } from 'react';
import { useParams as useRouteParams } from 'react-router-dom';
import { Button } from '../../../../atoms/Button/Button';
import { CodeResult } from '../../../../organisms';
import {
  ExternalAuthenticationContext,
  ProgramBlocksContext,
  ProgramBlocksContextValue,
} from '../../../Contexts';
import { ImportDataIconElement } from './ImportDataIcon.component';

const styles = css({
  borderRadius: '16px',
  padding: '12px',
  backgroundColor: 'rgba(140, 240, 142, 0.2)',
  border: '1px solid #F0F0F2',
  lineHeight: '2.5',
  margin: '16px 0',
  boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
});

const errorStyles = css({
  color: '#f55',
  fontWeight: 'bold',
});

const providers = ['internal', 'googlesheets', 'other'];

function padIdFromPadIdURiComponent(
  uriComponent: string | undefined
): string | undefined {
  if (!uriComponent) {
    return uriComponent;
  }
  const parts = uriComponent.split(':');
  if (parts.length > 1) {
    return parts[1];
  }
  return parts[0];
}

export const ImportDataElement: PlatePluginComponent = ({
  attributes,
  element,
  children,
}) => {
  const blocks = useContext<ProgramBlocksContextValue>(ProgramBlocksContext);
  const { createOrUpdateExternalData } = useContext(
    ExternalAuthenticationContext
  );
  const { padid: padIdUriComponent } = useRouteParams() as { padid?: string };
  const padId = padIdFromPadIdURiComponent(padIdUriComponent);

  const { id: blockId } = element;
  const {
    'data-contenttype': contentType,
    'data-varname': varName,
    'data-provider': provider,
    'data-external-id': externalId,
    'data-external-data-source-id': externalDataSourceId,
    'data-error': error,
    'data-auth-url': authUrl,
  } = element;

  const blockResults = useResult(blockId);
  const firstResultError = blockResults?.results?.find(
    (r) => !r.value && r?.type?.kind === 'type-error'
  );

  const externalIdEditable = !externalDataSourceId;

  const needsAuthentication: boolean =
    provider && provider !== 'internal' && firstResultError;

  const needsCreateOrUpdateExternalData: boolean =
    createOrUpdateExternalData &&
    padId &&
    provider &&
    provider !== 'internal' &&
    (!externalDataSourceId || needsAuthentication);

  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  return (
    <div {...attributes} contentEditable={false} css={styles}>
      {children}
      <ImportDataIconElement contentType={contentType} />
      {error && <span css={errorStyles}>{error}</span>}
      <div>
        <label htmlFor={`${blockId}:provider`}>provider: </label>
        <select
          id={`${blockId}:provider`}
          value={provider}
          onChange={(event) => {
            const changeTo = event.target.value;
            if (
              blockId &&
              blocks &&
              blocks.setBlockProvider &&
              changeTo !== provider
            ) {
              blocks?.setBlockProvider(blockId, changeTo);
            }
          }}
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${blockId}:varname`}>var name: </label>
        <input
          id={`${blockId}:varname`}
          type="text"
          onChange={(event) => {
            const changeTo = event.target.value;
            if (
              blockId &&
              blocks &&
              blocks.setBlockVarName &&
              changeTo !== varName
            ) {
              blocks?.setBlockVarName(blockId, changeTo);
            }
          }}
          value={varName}
        />
      </div>
      {provider && provider !== 'internal' && (
        <div>
          <label htmlFor={`${blockId}:externalId`}>URL: </label>
          {externalIdEditable ? (
            <input
              id={`${blockId}:externalId`}
              type="text"
              value={externalId}
              onChange={(event) => {
                const changeTo = event.target.value;
                if (
                  blockId &&
                  blocks &&
                  blocks.setBlockExternalId &&
                  changeTo !== externalId
                ) {
                  blocks?.setBlockExternalId(blockId, changeTo);
                }
              }}
            ></input>
          ) : (
            <a href="{externalId}" target="_blank">
              {externalId}
            </a>
          )}
        </div>
      )}
      {provider !== 'internal' &&
        (!externalDataSourceId || error || firstResultError) && (
          <div>
            <Button
              disabled={!needsCreateOrUpdateExternalData}
              primary
              onClick={() => {
                if (createOrUpdateExternalData) {
                  createOrUpdateExternalData({
                    authUrl,
                    padId: getDefined(padId),
                    blockId,
                    provider,
                    externalId,
                    externalDataSourceId,
                    error:
                      firstResultError?.type.kind === 'type-error'
                        ? new InferError(
                            firstResultError?.type.errorCause
                          ).toString()
                        : undefined,
                  });
                }
              }}
            >
              {needsAuthentication ? 'Authenticate' : 'Create'}
            </Button>
          </div>
        )}
      {blockResults?.results[0] && <CodeResult {...blockResults.results[0]} />}
    </div>
  );
};
