import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode } from 'react';
import { cssVar, grey100, p32Medium } from '../../primitives';
import { Ellipsis } from '../../icons';
import { Interactive } from '../../molecules';
import { useSubmittableInput } from '../../utils/useSubmittableInput';
import { InteractiveInputMenu } from '../InteractiveInputMenu/InteractiveInputMenu';

const numberInputStyles = css(p32Medium, {
  color: cssVar('strongTextColor'),
  borderRadius: '8px',
  backgroundColor: grey100.rgb,
  minWidth: 0,
  padding: '3px 8px',
});

type InputProps = Parameters<typeof useSubmittableInput>[0];

interface ValueInputProps {
  onChange: (value: string) => void;
  value: string;
  children?: ReactNode;
}

interface EditorInteractiveProps
  extends Pick<
      ComponentProps<typeof Interactive>,
      'name' | 'onAdd' | 'onChangeName' | 'readOnly'
    >,
    Pick<
      ComponentProps<typeof InteractiveInputMenu>,
      'onConvert' | 'onCopy' | 'onDelete'
    > {
  onChangeValue?: ValueInputProps['onChange'];
  value?: InputProps['value'];
  input?: ValueInputProps;
  children?: ReactNode;
}

const DefaultInput = ({
  onChange,
  value,
  children,
}: ValueInputProps): ReturnType<FC> => {
  const valueInputProps = useSubmittableInput({
    onChange,
    value,
  });
  return (
    <input {...valueInputProps} placeholder="10">
      {children}
    </input>
  );
};

export const EditorInteractiveInput = ({
  name,
  onAdd,
  onChangeName,
  onChangeValue = noop,
  onConvert,
  onCopy,
  onDelete,
  readOnly = false,
  value = '',
  children,
}: EditorInteractiveProps): ReturnType<FC> => {
  return (
    <Interactive
      name={name}
      onAdd={onAdd}
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
      <div css={numberInputStyles}>
        {children || <DefaultInput value={value} onChange={onChangeValue} />}
      </div>
    </Interactive>
  );
};
