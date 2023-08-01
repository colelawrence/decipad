/* eslint decipad/css-prop-named-variable: 0 */
import { ImportElementSource } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { Settings } from '../../icons';
import { MenuList, TextInputMenuItem } from '../../molecules';
import { cssVar, p13Medium } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { JsonPath, JsonPathMenuItem } from './JsonPathMenuItem';

const wrapperContainerStyles = css({
  marginBottom: '20px',
});
const buttonStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '4px',
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  backgroundColor: cssVar('backgroundSubdued'),
  ':hover, :focus': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
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
  delimiter?: string | string[];
  possibleJsonPaths: JsonPath[];
  setJsonPath: (jsonPath: string) => void;
  url: string;
  setUrl: (url: string) => void;
  source?: ImportElementSource;
  setSource: (source: ImportElementSource) => void;
  setDelimiter: (delimiter: string) => void;
  isUiIntegration?: boolean;
}

const sourceTypes: ImportElementSource[] = [
  'decipad',
  'gsheets',
  'csv',
  'json',
  'postgresql',
  'mysql',
  'oracledb',
  'cockroachdb',
  'redshift',
  'mariadb',
];

const delimiters = [',', ';'];

export const LiveConnectionParams: FC<LiveConnectionParamsProps> = ({
  url,
  setUrl,
  source,
  setSource,
  jsonPath,
  possibleJsonPaths,
  setJsonPath,
  delimiter,
  setDelimiter,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [subMenuOpen, setSubmenuOpen] = useState<
    'source' | 'jsonPath' | 'delimiter' | undefined
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
        styles={css({ width: '300px' })}
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
                key={sourceType}
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
        {(!source || source === 'csv') && (
          <MenuItem>
            <MenuList
              onChangeOpen={() => setSubmenuOpen('delimiter')}
              open={open && subMenuOpen === 'delimiter'}
              itemTrigger={
                <TriggerMenuItem>
                  <span css={labelStyles}>Delimiter</span>
                </TriggerMenuItem>
              }
            >
              {delimiters.map((delimtierCandidate) => (
                <MenuItem
                  key={delimtierCandidate}
                  selected={delimtierCandidate === delimiter}
                  onSelect={() => setDelimiter(delimtierCandidate)}
                >
                  {delimtierCandidate}
                </MenuItem>
              ))}
            </MenuList>
          </MenuItem>
        )}
      </MenuList>
    </div>
  );
};
