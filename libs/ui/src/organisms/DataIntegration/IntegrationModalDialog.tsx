import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Button } from '../../atoms';
import { AnnotationWarning } from '../../icons';
import { cssVar, p12Medium, p13Bold } from '../../primitives';
import { MessageBlock } from './MessageBlock';

interface DataSource {
  name: string;
  icon: ReactNode;
  provider: string | undefined;
}

export interface IntegrationModalDialogProps {
  onSelectSource: (provider: string | undefined) => void;
  dataSources: Array<DataSource>;
}

export const IntegrationModalDialog: FC<IntegrationModalDialogProps> = ({
  onSelectSource,
  dataSources,
}) => {
  return (
    <div css={wrapperStyles}>
      <div css={dataGridStyles}>
        {Object.values(dataSources).map((source) => {
          // TODO remove this when these databases are actually supported
          const isDbSupported = !!source.provider || source.name !== 'MongoDB';
          return (
            <div
              css={[dataCardStyles, isDbSupported ? {} : disabledDb]}
              key={source.name}
              onClick={() => isDbSupported && onSelectSource(source.provider)}
            >
              {source.icon}
              <span>
                {isDbSupported ? source.name : `${source.name} (soon)`}
              </span>
            </div>
          );
        })}
      </div>
      <div css={importFileWrapperStyles}>
        <div css={importFileTopbarStyles}>
          <span>
            <span css={p13Bold}>Import from File</span>
            <span css={p12Medium}>(you can also drag & drop)</span>
          </span>
          <span>
            <span css={p12Medium}>
              We currently support CSV or XLS up to a file size of 10MB.
            </span>
          </span>
        </div>
        <div css={importFileActionStyles}>
          <input css={inputStyles} />
          <Button type="primary">Choose file...</Button>
        </div>
      </div>
      <MessageBlock
        type="annotationWarning"
        icon={<AnnotationWarning />}
        title="Current Data Import Limits"
        message="We support data up to a maximum size of 200.000 cells (e.g. 10.000 rows by 20 columns, or 20.000 rows by 10 columns, etc.). If you want to import a larger dataset, contact us directly."
        overrideTextColor={true}
      />
    </div>
  );
};

const disabledDb = css({
  opacity: 0.6,
});

const wrapperStyles = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const dataGridStyles = css({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridTemplateRows: '80px 80px',
  gap: '10px',
});

const dataCardStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',

  borderRadius: '6px',
  backgroundColor: cssVar('highlightColor'),

  div: {
    width: '32px',
    height: '32px',
  },

  img: {
    height: '24px',
  },
});

const importFileWrapperStyles = css({
  width: '100%',

  backgroundColor: cssVar('highlightColor'),
  borderRadius: '6px',

  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '8px',
});

const importFileTopbarStyles = css({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
});

export const inputStyles = css({
  background: cssVar('backgroundColor'),
  borderRadius: '6px',
  padding: '6px 12px',
  border: `1px solid ${cssVar('strongerHighlightColor')}`,

  width: '100%',
});

const importFileActionStyles = css({
  paddingTop: '8px',

  display: 'flex',
  gap: '8px',

  button: {
    flex: '0 0 120px',
  },
});
