/* eslint decipad/css-prop-named-variable: 0 */
import { ChangeEvent, FC, FormEvent, useRef } from 'react';
import { Button, InputField, MenuItem, MenuList } from '../../../shared';
import * as Styled from './styles';
import { useActiveElement } from '@decipad/react-utils';
import { ButtonProps } from 'libs/ui/src/shared/atoms/Button/Button';

export const UploadCSV: FC<{
  onAttachment: (_e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  type?: ButtonProps['type'];
  text?: string;
  onOpenUrlImport: () => void;
}> = ({
  type = 'primary',
  text = 'Add CSV',
  onOpenUrlImport,
  onAttachment,
}) => {
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  return (
    <Styled.Wrapper>
      <Styled.FileUpload
        ref={fileUploadInputRef}
        type="file"
        accept=".csv"
        onChange={onAttachment}
      />
      <MenuList
        root
        dropdown
        sideOffset={4}
        align="center"
        trigger={
          <div>
            <Button testId="add-csv" type={type}>
              {text}
            </Button>
          </div>
        }
      >
        <MenuItem
          css={{ minWidth: '120px' }}
          onSelect={() => {
            fileUploadInputRef.current?.click();
          }}
        >
          Upload file
        </MenuItem>
        <MenuItem css={{ minWidth: '120px' }} onSelect={onOpenUrlImport}>
          Import from link
        </MenuItem>
      </MenuList>
    </Styled.Wrapper>
  );
};
export const UploadFromUrl: FC<{
  onImportUrl: (_e: FormEvent<HTMLFormElement>) => Promise<void>;
  onBlur?: () => void;
}> = ({ onImportUrl, onBlur }) => {
  const formRef = useActiveElement<HTMLFormElement>(() => onBlur && onBlur());
  return (
    <Styled.LinkWrapper onSubmit={onImportUrl} ref={formRef}>
      <InputField
        required
        autoFocus
        testId="csv-link"
        size="small"
        placeholder="Link to CSV"
        pattern="https?://.+" // TODO: should we enforce this?
        name="csvLink"
      />
      <Button submit type="primary" testId="import-link-csv">
        Import
      </Button>
    </Styled.LinkWrapper>
  );
};
