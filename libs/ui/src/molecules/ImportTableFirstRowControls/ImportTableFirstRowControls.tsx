/* eslint decipad/css-prop-named-variable: 0 */
import { once } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Tooltip } from '../../atoms';
import { Heading1 } from '../../icons/index';
import {
  mouseMovingOverTransitionDelay,
  shortAnimationDuration,
} from '../../primitives';
import { editorLayout } from '../../styles';
import { importTableDragHandleStyles } from '../../styles/table';

export interface ImportTableRowControlsProps {
  readonly isFirstRow?: boolean;
  readonly toggleFirstRowIsHeader: (isFirstRow: boolean) => void;
}

const gridStyles = once(() =>
  css({
    display: 'grid',
    gridTemplate: `
      ".                          handle                             " ${editorLayout.gutterHandleHeight()}
      "menu                       .                                  " auto
      /minmax(max-content, 144px) ${editorLayout.gutterHandleWidth()}
    `,
    justifyContent: 'end',
  })
);

const importTableRowControlsWrapperStyles = css({
  '*:hover > &': {
    opacity: 'unset',
  },
  transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
  verticalAlign: 'middle',
});

export const ImportTableFirstRowControls: FC<ImportTableRowControlsProps> = ({
  isFirstRow = false,
  toggleFirstRowIsHeader,
}) => {
  const menuButton = (
    <button
      onClick={() => toggleFirstRowIsHeader(true)}
      css={importTableDragHandleStyles}
    >
      <Heading1 />
    </button>
  );

  return (
    <th contentEditable={false} css={importTableRowControlsWrapperStyles}>
      {isFirstRow && (
        <div css={gridStyles()}>
          <Tooltip trigger={menuButton}>Make this the header row</Tooltip>
        </div>
      )}
    </th>
  );
};
