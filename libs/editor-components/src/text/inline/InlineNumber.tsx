import { css } from '@emotion/react';
import {
  ElementAttributes,
  InlineNumberElement,
  PlateComponent,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { brand700, CodeResult, cssVar } from '@decipad/ui';
import { useComputer, useShadowCodeLine } from '@decipad/react-contexts';
import { useSelected } from 'slate-react';
import { useMergedRef } from '@decipad/ui/src/hooks/useMergedRef';

export const InlineNumber: PlateComponent = ({
  attributes,
  children,
  ...rest
}) => {
  const element = getDefined(rest?.element as InlineNumberElement);
  const blockId = element.id;

  const elementRef = (attributes as ElementAttributes).ref;

  const calcId = element.blockId || '';
  const result = useComputer().getBlockIdResult$.use(calcId);

  const isSelected = useSelected();
  const shadow = useShadowCodeLine(element.id);

  return (
    <>
      <span
        {...attributes}
        id={blockId}
        data-highlight-changes
        css={css(containerStyle, [
          isSelected && selectedStyle,
          shadow.isEditing && { cursor: 'pointer' },
        ])}
        onClick={() => shadow.editSource(calcId)}
        data-testid="inline-number-element"
        ref={useMergedRef(shadow.numberRef, elementRef)}
      >
        {result?.result ? (
          <span contentEditable={false}>
            <CodeResult {...result.result} />
          </span>
        ) : (
          '...'
        )}
        {children}
      </span>
      {shadow.portal}
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
