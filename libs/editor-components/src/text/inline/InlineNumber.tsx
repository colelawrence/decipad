import { css } from '@emotion/react';
import {
  ElementAttributes,
  InlineNumberElement,
  PlateComponent,
} from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { brand700, CodeResult, cssVar } from '@decipad/ui';
import { useComputer, useShadowCodeLine } from '@decipad/react-contexts';
import { useMergedRef } from '@decipad/ui/src/hooks/useMergedRef';
import { useSelected } from 'slate-react';
import { useCallback } from 'react';

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

  const { editSource } = shadow;

  const openEditor = useCallback(() => {
    editSource(calcId, element);
  }, [editSource, element, calcId]);

  return (
    <>
      <span
        {...attributes}
        id={blockId}
        data-highlight-changes
        onClick={openEditor}
        css={css(containerStyle, [
          isSelected && selectedStyle,
          shadow.isEditing && { cursor: 'pointer' },
        ])}
        data-testid="inline-number-element"
        ref={useMergedRef(shadow.numberRef, elementRef)}
      >
        {result?.result ? (
          <span contentEditable={false}>
            <CodeResult {...result.result} element={element} />
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
