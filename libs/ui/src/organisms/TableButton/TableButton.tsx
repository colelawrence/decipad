import { css } from '@emotion/react';
import { FC } from 'react';
import { TextAndIconButton } from '../../atoms';
import { Chevron, Eye } from '../../icons';

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
  readonly setState: (state?: any) => void;
  readonly isInState?: boolean;
  readonly captions: string[];
  readonly isExpandButton?: boolean;
}

export const TableButton: FC<TableButtonProps> = ({
  isInState,
  setState,
  captions,
  isExpandButton = false,
}) => {
  const handleClick = () => {
    setState(!isInState);
  };

  const textToShow = captions[1]
    ? isInState && isExpandButton
      ? captions[0]
      : captions[1]
    : captions[0];

  return (
    <div css={showMoreButtonWrapperStyles} contentEditable={false}>
      <TextAndIconButton
        text={textToShow}
        onClick={isExpandButton ? handleClick : setState}
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
