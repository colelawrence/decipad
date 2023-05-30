/* eslint decipad/css-prop-named-variable: 0 */
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
  readonly isToggleButton?: boolean;
}

export const TableButton: FC<TableButtonProps> = ({
  isInState,
  setState,
  onClick,
  captions,
  isExpandButton = false,
  isToggleButton = false,
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
    setState?.(!isInState);
  }, [isInState, onClick, setState]);

  const textToShow = captions[1]
    ? isInState && (isExpandButton || isToggleButton)
      ? captions[0]
      : captions[1]
    : captions[0];

  return (
    <div // please don't change this to a button, as bad things will happen, like breaking the layout *only* on headless chrome, (which runs on E2E tests). That would not be fun!!!!
      css={[showMoreButtonWrapperStyles, hideOnPrint]}
      data-testid={`table-button-${captions
        .map((a) => a.replace(/\W/g, '').toLocaleLowerCase())
        .join('-')}`}
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
