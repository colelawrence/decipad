import { FC } from 'react';
import { Modal } from '../../molecules';
import { Progress } from '../../molecules/Progress/Progress';

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
