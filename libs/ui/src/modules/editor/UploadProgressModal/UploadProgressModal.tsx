import { FC } from 'react';
import { Modal, Progress } from '../../../shared';

interface UploadProgressModalProps {
  files: Array<{
    name: string;
    progress: number;
  }>;
}

export const UploadProgressModal: FC<UploadProgressModalProps> = ({
  files,
}) => {
  return (
    <Modal>
      <p>Uploading</p>
      {files.map((file, index) => (
        <div key={index}>
          <Progress label={file.name} progress={file.progress} />
        </div>
      ))}
    </Modal>
  );
};
