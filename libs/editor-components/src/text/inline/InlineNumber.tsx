import { css } from '@emotion/react';
import { InlineNumberElement, PlateComponent } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { brand700, cssVar } from '@decipad/ui';
import {
  useDeleteEmptyInlineNumber,
  useEditInlineNumberName,
  useInlineNumberSyntaxFixer,
} from './InlineNumber.hooks';

export const InlineNumber: PlateComponent = ({
  attributes,
  children,
  ...rest
}) => {
  const element = getDefined(rest?.element as InlineNumberElement);
  const blockId = element.id;

  useDeleteEmptyInlineNumber(element);
  useInlineNumberSyntaxFixer(element);
  const { isEditing, allowNameEditing } = useEditInlineNumberName(element);

  return (
    <span
      data-highlight-changes
      {...attributes}
      id={blockId}
      css={css(containerStyle, isEditing ? {} : { cursor: 'pointer' })}
      onClick={allowNameEditing}
    >
      <span contentEditable={false}>{'\u2060'}</span>
      {children}
      <span contentEditable={false}>{'\u2060'}</span>
    </span>
  );
};

const containerStyle = css({
  borderRadius: '9px',
  backgroundColor: `${cssVar('highlightColor')}`,
  color: brand700.rgb,
  paddingLeft: '6px',
  paddingRight: '6px',
});
