import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { cssVar, p32Medium } from '../../primitives';
import { Interactive } from '../../molecules';
import { useSubmittableInput } from '../../utils/useSubmittableInput';
import { InteractiveInputMenu } from '../InteractiveInputMenu/InteractiveInputMenu';
import { Ellipsis } from '../../icons';

const numberInputStyles = css(p32Medium, {
  color: cssVar('strongTextColor'),
  borderRadius: '8px',
  backgroundColor: cssVar('backgroundColor'),
  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
  },
  textOverflow: 'ellipsis',

  minWidth: 0,
  padding: '6px 8px',
});

type InputProps = Parameters<typeof useSubmittableInput>[0];

interface EditorInteractiveProps
  extends Pick<
      ComponentProps<typeof Interactive>,
      'name' | 'onChangeName' | 'readOnly'
    >,
    Pick<
      ComponentProps<typeof InteractiveInputMenu>,
      'onConvert' | 'onCopy' | 'onDelete'
    > {
  onChangeValue?: InputProps['onChange'];
  value?: InputProps['value'];
}

export const EditorInteractiveInput = ({
  name,
  onChangeName,
  onChangeValue = noop,
  onConvert,
  onCopy,
  onDelete,
  readOnly = false,
  value = '',
}: EditorInteractiveProps): ReturnType<FC> => {
  const valueInputProps = useSubmittableInput({
    onChange: onChangeValue,
    value,
  });
  return (
    <Interactive
      name={name}
      onChangeName={onChangeName}
      readOnly={readOnly}
      right={
        <InteractiveInputMenu
          onConvert={onConvert}
          onCopy={onCopy}
          onDelete={onDelete}
          trigger={
            <button>
              <Ellipsis />
            </button>
          }
        />
      }
    >
      <input {...valueInputProps} css={numberInputStyles} placeholder="10" />
    </Interactive>
  );
};
