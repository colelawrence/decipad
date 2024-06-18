import { Button } from '@decipad/ui';
import { css } from '@emotion/react';
import debounce from 'lodash/debounce';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { SearchFieldWithDropdown } from '../../molecules';

type DropdownChoice = {
  label: string;
  description: string;
};

type SearchFormProps = {
  searchTerm: string;
  label: string;
  placeholder: string;
  showButton?: boolean;
  onSearchChange: (newValue: string) => void;
  onSearchSubmit: (selectedDropdownValue: string, query?: string) => void;
  icon?: ReactNode;
  disabled?: boolean;
  variant?: boolean;
  dropdownChoices?: DropdownChoice[];
};

const SearchForm: React.FC<SearchFormProps> = ({
  searchTerm,
  placeholder,
  onSearchChange,
  onSearchSubmit,
  label,
  icon,
  dropdownChoices,
  variant = false,
  showButton = true,
  disabled = false,
}) => {
  const [selectedDropdownValue, setSelectedDropdownValue] = useState(
    dropdownChoices?.[0].label || ''
  );

  const handleDropdownChange = (newValue: string) => {
    setSelectedDropdownValue(newValue);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit(selectedDropdownValue);
  };

  const debouncedOnSearchSubmitRef = useRef(
    debounce((selectedValue, query) => {
      onSearchSubmit(selectedValue, query);
    }, 500)
  );

  useEffect(() => {
    const debouncedOnSearchSubmit = debouncedOnSearchSubmitRef.current;

    return () => {
      debouncedOnSearchSubmit.cancel();
    };
  }, [debouncedOnSearchSubmitRef]);

  return (
    <form onSubmit={handleSubmit} css={searchFormStyles}>
      <SearchFieldWithDropdown
        searchTerm={searchTerm}
        onSearchChange={(newValue) => {
          onSearchChange(newValue);
          if (!showButton) {
            debouncedOnSearchSubmitRef.current('', newValue);
          }
        }}
        placeholder={placeholder}
        dropdownChoices={dropdownChoices}
        selectedDropdownValue={selectedDropdownValue}
        icon={icon}
        variant={variant ? 'textarea' : 'input'}
        handleDropdownChange={(newSelection) =>
          handleDropdownChange(newSelection)
        }
      />
      {showButton && (
        <Button type="primary" disabled={disabled}>
          {label}
        </Button>
      )}
    </form>
  );
};

const searchFormStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
});

export default SearchForm;
