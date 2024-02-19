/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { useSafeState } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { useState } from 'react';
import { OpaqueColor } from '@decipad/utils';
import { Button, ColorPicker, InputField, Modal } from '../../../shared';

import { p13Regular } from '../../../primitives';
import {
  AvailableSwatchColor,
  swatchNames,
  swatchesThemed,
} from '../../../utils';

type CreateSectionModalProps = {
  readonly onSubmit: (name: string, color: OpaqueColor) => void | Promise<void>;
  readonly op?: 'create' | 'edit';
  readonly placeholderName?: string;
  readonly placeholderColor?: string;

  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const CreateOrEditSectionModal = ({
  open,
  onOpenChange,
  onSubmit,
  op = 'create',
  placeholderName,
  placeholderColor = 'Catskill' as AvailableSwatchColor,
}: CreateSectionModalProps): ReturnType<React.FC> => {
  const [name, setName] = useState(placeholderName || '');
  const [isSubmitting, setIsSubmitting] = useSafeState(false);
  const [color, setColor] = useState(placeholderColor);
  const term = op === 'create' ? 'Create' : 'Edit';
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`${term} folder`}>
      <form
        css={{ display: 'grid', rowGap: '12px' }}
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          try {
            await onSubmit(name, baseSwatches[color as AvailableSwatchColor]);
          } finally {
            setIsSubmitting(false);
            onOpenChange(false);
          }
        }}
      >
        {op === 'create' && (
          <p css={css(p13Regular, { maxWidth: 350 })}>
            Folders are how you can organize your documents within a workspace.
            For instance, you can create a <em>personal</em> and a <em>work</em>{' '}
            folder in your default workspace.
          </p>
        )}
        <InputField
          required
          placeholder="My folder"
          value={name}
          onChange={setName}
        />
        <div
          css={{
            display: 'inline-flex',
            flexDirection: 'row',
            gap: 5,
            flexWrap: 'nowrap',
          }}
        >
          {swatchNames.map((key) => {
            return (
              <div
                key={key}
                aria-label={key}
                onClick={(ev) => {
                  ev.preventDefault();
                  setColor(key);
                }}
              >
                <ColorPicker
                  color={baseSwatches[key]}
                  selected={key === color}
                />
              </div>
            );
          })}
        </div>
        <Button type="secondary" submit disabled={!name || isSubmitting}>
          {term} Folder
        </Button>
      </form>
    </Modal>
  );
};
