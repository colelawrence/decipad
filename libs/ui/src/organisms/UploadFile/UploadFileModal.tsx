import { FileType, MAX_UPLOAD_FILE_SIZE } from '@decipad/editor-types';
import { useToast } from '@decipad/toast';
import { isValidURL } from '@decipad/ui';
import { css } from '@emotion/react';
import { ChangeEvent, FC, useMemo, useRef, useState } from 'react';
import { Button, TextAndIconButton } from '../../atoms';
import { Close } from '../../icons';
import { Tabs } from '../../molecules/Tabs/Tabs';
import { cssVar, p12Medium, p15Medium } from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';

interface UploadFileModalProps {
  fileType?: FileType;
  onCancel: () => void;
  onUpload: (file: any, uploadType: string) => void;
}

interface FileCfg {
  title: string;
  maxSize: number;
  accept?: string;
}

const getConfigForFileType = (fileType: FileType | undefined): FileCfg => {
  switch (fileType) {
    case 'image':
      return {
        title: 'Insert image',
        maxSize: MAX_UPLOAD_FILE_SIZE.image,
        accept: 'image/jpeg, image/png, image/gif',
      };
    case 'media':
      return {
        title: 'Insert video',
        maxSize: MAX_UPLOAD_FILE_SIZE.media,
        accept: 'video/*',
      };
    case 'data':
      return {
        title: 'Upload a data file',
        maxSize: MAX_UPLOAD_FILE_SIZE.data,
        accept: '.csv, application/vnd.apache.arrow',
      };
    default:
      return { title: 'Upload a file', maxSize: 5_000_000 };
  }
};

export const UploadFileModal: FC<UploadFileModalProps> = ({
  fileType,
  onCancel,
  onUpload,
}) => {
  const { title, maxSize, accept } = getConfigForFileType(fileType);
  const MAX_LABEL = `${maxSize / 1_000_000}MB`;

  const [activeTab, setActiveTab] = useState('upload');
  const [fileName, setFileName] = useState('');
  const toast = useToast();

  const stringPerUploadFileType = useMemo(() => {
    return activeTab === 'upload'
      ? { button: 'Choose file' }
      : { button: 'Embed' };
  }, [activeTab]);

  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const files = evt?.target?.files;
    const uploadFile = files && files[0];
    if (uploadFile) {
      const { size } = uploadFile;
      if (size > maxSize) {
        return toast(`Upload failed: File size over ${MAX_LABEL}`, 'warning');
      }

      onUpload(uploadFile, 'upload');
    } else {
      // no file selected
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div css={wrapperStyles}>
      <div css={titleWrapperStyles}>
        <div css={titleStyles}>{title}</div>
        <div css={iconStyles}>
          <div css={closeButtonStyles} role="button" onClick={onCancel}>
            <Close />
          </div>
        </div>
      </div>
      <div css={tabWrapStyles}>
        <Tabs variant>
          <TextAndIconButton
            key="tab-1"
            size="fit"
            text="Upload"
            variantHover
            aria-selected={activeTab === 'upload'}
            notSelectedLook={activeTab !== 'upload'}
            color={activeTab === 'upload' ? 'grey' : 'transparent'}
            onClick={() => setActiveTab('upload')}
          />
          <TextAndIconButton
            key="tab-2"
            size="fit"
            text="Embed link"
            aria-selected={activeTab === 'embed'}
            variantHover
            notSelectedLook={activeTab !== 'embed'}
            color={activeTab === 'embed' ? 'grey' : 'transparent'}
            onClick={() => setActiveTab('embed')}
          />
        </Tabs>
      </div>
      <div css={importFileWrapperStyles}>
        <div css={importFileActionStyles}>
          {activeTab === 'embed' && (
            <>
              <input
                data-testid="upload-link-input"
                css={inputStyles}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
              <Button
                testId="embed-csv-button"
                type="primary"
                onClick={() => {
                  onUpload(fileName, 'embed');
                }}
                disabled={!isValidURL(fileName)}
              >
                {stringPerUploadFileType.button}
              </Button>
            </>
          )}
          {activeTab === 'upload' && (
            <>
              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                ref={fileInputRef}
                css={hiddenElement}
              />
              <Button type="primary" onClick={handleButtonClick}>
                {stringPerUploadFileType.button}
              </Button>
            </>
          )}
        </div>
        <span css={p12Medium}>
          You can also drag & drop, or copy & paste directly into the notebook.
        </span>
      </div>
    </div>
  );
};

const hiddenElement = css({
  display: 'none',
});

const iconStyles = css({
  marginLeft: 'auto',

  height: '30px',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',

  div: {
    width: '16px',
    height: '16px',
  },
});

const inputStyles = css({
  background: cssVar('backgroundColor'),
  borderRadius: '6px',
  padding: '6px 12px',
  border: `1px solid ${cssVar('strongerHighlightColor')}`,

  width: '100%',
});

const importFileActionStyles = css({
  display: 'flex',
  gap: '8px',

  button: {
    flex: '0 0 120px',
  },
});

const importFileWrapperStyles = css({
  width: '100%',

  backgroundColor: cssVar('highlightColor'),
  borderRadius: '6px',

  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px',
});

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '740px',
  maxHeight: '600px',
  padding: '32px',
  gap: '12px',

  border: `1px solid ${cssVar('highlightColor')}`,
  borderRadius: '12px',

  backgroundColor: cssVar('backgroundColor'),
});

const titleStyles = css(p15Medium, {
  lineHeight: '30px',
  paddingLeft: '5px',
  paddingRight: '15px',
  width: '100%',
});

const titleWrapperStyles = css({
  color: cssVar('strongTextColor'),
  height: '30px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',
});

const tabWrapStyles = css({
  width: '100%',
});
