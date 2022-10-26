import { css } from '@emotion/react';
import { InlineNumberElement, PlateComponent } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { brand700, cssVar } from '@decipad/ui';
import { useSelected } from 'slate-react';

export const InlineNumber: PlateComponent = ({
  attributes,
  children,
  ...rest
}) => {
  const element = getDefined(rest?.element as InlineNumberElement);
  const blockId = element.id;

  const isSelected = useSelected();

  return (
    <>
      <span
        data-highlight-changes
        {...attributes}
        id={blockId}
        css={css(containerStyle, [isSelected && selectedStyle])}
        data-testid="inline-number-element"
      >
        <span contentEditable={false}>🚧</span>
        {children}
      </span>
    </>
  );
};

const containerStyle = css({
  borderRadius: '9px',
  color: brand700.rgb,
  paddingLeft: '6px',
  paddingRight: '6px',
});

const selectedStyle = css({
  backgroundColor: `${cssVar('highlightColor')}`,
});
