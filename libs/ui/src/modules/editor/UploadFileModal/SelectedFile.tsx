import { css } from '@emotion/react';
import { Image, Trash, WarningCircle } from '../../../icons';
import { Tooltip } from 'libs/ui/src/shared';
import React from 'react';
import {
  cssVar,
  cssVarHex,
  normalOpacity,
  p12Bold,
  transparencyHex,
} from '../../../primitives';
import {
  fileNameStyles,
  fileWarningRoundStyles,
  selectedFileStyles,
  selectedFileStylez,
} from './styles';

interface SelectedFileProps {
  selectedFile: File | null;
  fileError: string | null;
  removeSelectedFile: () => void;
}

export const SelectedFile: React.FC<SelectedFileProps> = ({
  selectedFile,
  fileError,
  removeSelectedFile,
}) => {
  if (!selectedFile) {
    return null;
  }

  const selectedFileWrapperStyles = [
    p12Bold,
    selectedFileStyles,
    fileError && {
      border: 0,
      backgroundColor: transparencyHex(
        cssVarHex('stateDangerIconBackground'),
        normalOpacity
      ),
      color: cssVar('stateDangerIconOutline'),
    },
  ];

  const removeFileStyles = css(
    { height: 16, width: 16 },
    fileError && {
      svg: { path: { stroke: cssVar('stateDangerIconOutline') } },
    }
  );

  return (
    <div css={selectedFileWrapperStyles}>
      <div css={selectedFileStylez}>
        {fileError ? (
          <Tooltip
            hoverOnly
            trigger={
              <div css={fileWarningRoundStyles}>
                <WarningCircle />
              </div>
            }
          >
            {fileError}
          </Tooltip>
        ) : (
          <Image />
        )}
      </div>
      <div css={fileNameStyles}>{selectedFile.name}</div>
      <div>{(selectedFile.size / 1_000_000).toFixed(2)}MB</div>
      <button
        css={removeFileStyles}
        onClick={removeSelectedFile}
        aria-label="Remove file"
      >
        <Trash />
      </button>
    </div>
  );
};
