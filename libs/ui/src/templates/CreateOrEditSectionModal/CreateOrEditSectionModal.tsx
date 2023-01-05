import { useThemeFromStore } from '@decipad/react-contexts';
import { useSafeState } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { useState } from 'react';
import { Button, ColorPicker, InputField } from '../../atoms';
import { ClosableModal } from '../../organisms';
import { OpaqueColor, p13Regular } from '../../primitives';
import { AvailableSwatchColor, swatchesThemed, swatchNames } from '../../utils';

type CreateSectionModalProps = {
  readonly onClose: () => void;
  readonly onSubmit: (name: string, color: OpaqueColor) => void | Promise<void>;
  readonly op?: 'create' | 'edit';
  readonly placeholderName?: string;
  readonly placeholderColor?: string;
};

export const CreateOrEditSectionModal = ({
  onClose,
  onSubmit,
  op = 'create',
  placeholderName,
  placeholderColor = 'Catskill' as AvailableSwatchColor,
  ...props
}: CreateSectionModalProps): ReturnType<React.FC> => {
  const [name, setName] = useState(placeholderName || '');
  const [isSubmitting, setIsSubmitting] = useSafeState(false);
  const [color, setColor] = useState(placeholderColor);
  const term = op === 'create' ? 'Create' : 'Edit';
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);

  return (
    <ClosableModal
      {...props}
      Heading="h1"
      title={`${term} section`}
      closeAction={onClose}
    >
      <form
        css={{ display: 'grid', rowGap: '12px' }}
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          try {
            await onSubmit(name, baseSwatches[color as AvailableSwatchColor]);
          } finally {
            setIsSubmitting(false);
            onClose();
          }
        }}
      >
        {op === 'create' && (
          <p css={css(p13Regular)}>
            Sections are how you can organize your documents within a workspace.
            For instance, you can create a <em>personal</em> and a <em>work</em>{' '}
            section in your default workspace.
          </p>
        )}
        <InputField
          required
          placeholder="My section"
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
          {term} Section
        </Button>
      </form>
    </ClosableModal>
  );
};
