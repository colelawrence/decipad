import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { TextAndIconButton } from '../../atoms';
import { Chevron, Eye } from '../../icons';
import { hideOnPrint } from '../../styles/editor-layout';

const showMoreButtonWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  paddingBottom: '5px',
  'div > button > span > svg': {
    height: '8px',
  },
  padding: '5px',
});

interface TableButtonProps {
  readonly setState?: (state: boolean) => void;
  readonly onClick?: () => void;
  readonly isInState?: boolean;
  readonly captions: string[];
  readonly isExpandButton?: boolean;
}

export const TableButton: FC<TableButtonProps> = ({
  isInState,
  setState,
  onClick,
  captions,
  isExpandButton = false,
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
    setState?.(!isInState);
  }, [isInState, onClick, setState]);

  const textToShow = captions[1]
    ? isInState && isExpandButton
      ? captions[0]
      : captions[1]
    : captions[0];

  return (
    <div
      css={[showMoreButtonWrapperStyles, hideOnPrint]}
      contentEditable={false}
    >
      <TextAndIconButton
        text={textToShow}
        onClick={handleClick}
        iconPosition="left"
      >
        {isExpandButton ? (
          <Chevron type={isInState && isExpandButton ? 'expand' : 'collapse'} />
        ) : (
          <Eye />
        )}
      </TextAndIconButton>
    </div>
  );
};
