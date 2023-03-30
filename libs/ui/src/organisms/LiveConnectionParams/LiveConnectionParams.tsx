import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { ImportElementSource } from '@decipad/editor-types';
import { Settings } from '../../icons';
import { MenuList, TextInputMenuItem } from '../../molecules';
import { cssVar, p13Medium } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { JsonPath, JsonPathMenuItem } from './JsonPathMenuItem';
import { MenuItem, TriggerMenuItem } from '../../atoms';

const wrapperContainerStyles = css({
  marginBottom: '20px',
});

const buttonStyles = css({
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderColor')}`,
  backgroundColor: cssVar('tintedBackgroundColor'),

  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
  },
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '4px',
});

const iconStyles = css({
  width: '12px',
});

const buttonTextStyles = css(p13Medium, {
  whiteSpace: 'nowrap',
  padding: '0 4px',
});

const labelStyles = css({
  display: 'flex',
  minWidth: '80px',
});

export interface LiveConnectionParamsProps {
  jsonPath: string;
  possibleJsonPaths: JsonPath[];
  setJsonPath: (jsonPath: string) => void;
  url: string;
  setUrl: (url: string) => void;
  source?: ImportElementSource;
  setSource: (source: ImportElementSource) => void;
}

const sourceTypes: ImportElementSource[] = [
  'decipad',
  'gsheets',
  'csv',
  'json',
  'arrow',
];

export const LiveConnectionParams: FC<LiveConnectionParamsProps> = ({
  url,
  setUrl,
  source,
  setSource,
  jsonPath,
  possibleJsonPaths,
  setJsonPath,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [subMenuOpen, setSubmenuOpen] = useState<
    'source' | 'jsonPath' | undefined
  >();
  const onChangeOpen = useCallback((newOpen: boolean) => {
    setSubmenuOpen(undefined);
    setOpen(newOpen);
  }, []);

  return (
    <div css={[wrapperContainerStyles, hideOnPrint]}>
      <MenuList
        root
        dropdown
        onChangeOpen={onChangeOpen}
        open={open}
        // Width hard coded to deal with "Monochrome Yellow", the longest color name :(
        styles={css({ width: '290px' })}
        trigger={
          <button css={buttonStyles}>
            <span css={iconStyles}>{<Settings />}</span>
            <span css={buttonTextStyles}>Settings</span>
          </button>
        }
      >
        <TextInputMenuItem value={url} onChange={setUrl}>
          <span css={labelStyles}>URL:</span>
        </TextInputMenuItem>
        <MenuItem>
          <MenuList
            onChangeOpen={useCallback(() => setSubmenuOpen('source'), [])}
            open={open && subMenuOpen === 'source'}
            itemTrigger={
              <TriggerMenuItem>
                <span css={labelStyles}>Source</span>
              </TriggerMenuItem>
            }
          >
            {sourceTypes.map((sourceType) => (
              <MenuItem
                selected={sourceType === source}
                onSelect={() => setSource(sourceType)}
              >
                {sourceType}
              </MenuItem>
            ))}
          </MenuList>
        </MenuItem>
        {(!source || source === 'json') && (
          <>
            <TextInputMenuItem value={jsonPath ?? ''} onChange={setJsonPath}>
              <span css={labelStyles}>JSON Path:</span>
            </TextInputMenuItem>
            {possibleJsonPaths.length > 0 && (
              <JsonPathMenuItem
                onChangeOpen={() => setSubmenuOpen('jsonPath')}
                open={open && subMenuOpen === 'jsonPath'}
                selectedJsonPath={jsonPath}
                itemTrigger={<TriggerMenuItem>Select</TriggerMenuItem>}
                jsonPaths={possibleJsonPaths}
                onSelect={setJsonPath}
              />
            )}
          </>
        )}
      </MenuList>
    </div>
  );
};
