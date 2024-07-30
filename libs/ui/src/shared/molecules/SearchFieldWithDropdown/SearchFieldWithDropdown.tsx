import {
  Dropdown,
  InputField,
  TextareaField,
  sanitizeInput,
} from '@decipad/ui';
import { css } from '@emotion/react';
import React from 'react';
import { DropdownChoice } from '../../atoms/Dropdown/Dropdown';
import { searchFieldWithContainerStyles, searchIconStyles } from './styles';

interface BaseProps {
  searchTerm: string;
  onSearchChange: (newValue: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  variant?: 'input' | 'textarea';
}

interface DropdownProps {
  dropdownChoices: DropdownChoice[];
  selectedDropdownValue: string;
  handleDropdownChange: (newValue: string) => void;
}

export type SearchFieldWithDropdownProps = BaseProps &
  Partial<DropdownProps> & {
    dropdownChoices?: DropdownChoice[];
  };

export const SearchFieldWithDropdown: React.FC<
  SearchFieldWithDropdownProps
> = ({
  searchTerm,
  onSearchChange,
  placeholder,
  dropdownChoices,
  selectedDropdownValue,
  handleDropdownChange,
  icon,
  variant = 'input',
}) => {
  const searchDropdownWrapper = css(
    searchFieldWithContainerStyles,
    variant === 'textarea' && {
      textarea: { resize: 'none' },
      height: '100%',
      alignItems: 'flex-start',
    }
  );

  const renderDropdown = () => {
    if (
      dropdownChoices &&
      handleDropdownChange &&
      selectedDropdownValue !== undefined
    ) {
      return (
        <span data-testid="select-search-field-drop">
          <Dropdown
            onChange={handleDropdownChange}
            selection={selectedDropdownValue}
            possibleSelections={dropdownChoices}
          />
        </span>
      );
    }
    return null;
  };

  const renderInput = () => {
    if (variant === 'textarea') {
      return (
        <TextareaField
          value={searchTerm}
          height={5}
          onChange={(search) => onSearchChange(search)}
          placeholder={placeholder}
        />
      );
    }
    return (
      <InputField
        value={searchTerm}
        onChange={(search) => {
          const sanitizedValue = sanitizeInput({
            input: search,
            isURL: false,
          });
          onSearchChange(sanitizedValue);
        }}
        size="small"
        placeholder={placeholder}
        autocomplete={'off'}
      />
    );
  };

  return (
    <div css={searchDropdownWrapper}>
      {icon && <div css={searchIconStyles}>{icon}</div>}
      {renderInput()}
      {renderDropdown()}
    </div>
  );
};
