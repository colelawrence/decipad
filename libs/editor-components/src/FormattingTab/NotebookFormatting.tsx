import { useEditorController } from '@decipad/notebook-state';
import { useWriteOnBlur } from './proxy-fields/ProxyStringField';
import { DropdownField, InputField, MenuItem } from '@decipad/ui';
import { NumberFormatting } from '@decipad/editor-types';
import { FormWrapper } from './FormWrapper';
import { Filters } from '../Filters';

export interface NotebookFormattingProps {
  numberFormatting: NumberFormatting | undefined;
  setNumberFormatting: (formatting: NumberFormatting | undefined) => void;
}

const numberFormattingLabels: Record<NumberFormatting, string> = {
  automatic: 'Automatic',
  precise: 'Precise',
  financial: 'Financial',
  scientific: 'Scientific',
};

const numberFormattingOptions = Object.keys(
  numberFormattingLabels
) as NumberFormatting[];

export const NotebookFormatting = ({
  numberFormatting = 'automatic',
  setNumberFormatting,
}: NotebookFormattingProps) => {
  const editorController = useEditorController();
  const title = editorController.useTitle();

  const [value, setValue, { onFocus, onBlur, onSubmit }] = useWriteOnBlur(
    title ?? '',
    (newTitle) => editorController.setTitle(newTitle)
  );

  return (
    <FormWrapper>
      <InputField
        type="text"
        size="small"
        label="Notebook title"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        onFocus={onFocus}
        onBlur={onBlur}
        onEnter={onSubmit}
      />
      <Filters />
      <DropdownField
        label="Number formatting"
        triggerText={numberFormattingLabels[numberFormatting]}
      >
        {numberFormattingOptions.map((option) => (
          <MenuItem
            key={option}
            onSelect={() => setNumberFormatting(option)}
            selected={option === numberFormatting}
          >
            {numberFormattingLabels[option]}
          </MenuItem>
        ))}
      </DropdownField>
    </FormWrapper>
  );
};
