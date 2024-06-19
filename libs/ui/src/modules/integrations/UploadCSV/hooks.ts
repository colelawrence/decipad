import {
  useAttachFileToWorkspaceMutation,
  useCreateExternalDataSourceMutation,
  useGetCreateAttachmentFormWorkspaceMutation,
} from '@decipad/graphql-client';
import { useResourceUsage } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import axios from 'axios';
import { ChangeEvent, FormEvent, useState } from 'react';
import Papaparse from 'papaparse';

import { env } from '@decipad/client-env';

const ONE_MEGABYTE = 1_000_000;

async function isCSV(url: string) {
  try {
    const res = await fetch(url);

    // Let's only get the first 10 lines. So this continues to be very fast.
    const body = (await res.text()).split('\n').slice(0, 10).join('\n');

    const result = Papaparse.parse(body);
    return result.errors.length === 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}

type OnAttachmentProps = {
  workspaceId: string;
  afterUpload?: (_: string) => void;
};

type OnAttachmentResult = {
  onAttachment: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  progress: number | undefined;
};

export const useOnAttachment = ({
  workspaceId,
  afterUpload = () => {},
}: OnAttachmentProps): OnAttachmentResult => {
  const [, getCreateAttachmentFormWorkspace] =
    useGetCreateAttachmentFormWorkspaceMutation();
  const [, attachFileToWorkspace] = useAttachFileToWorkspaceMutation();

  const [progress, setProgress] = useState<number | undefined>(undefined);

  const { storage } = useResourceUsage();
  const toast = useToast();

  const onAttachment = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (e.target.files == null || e.target.files.length === 0) {
      toast('No files were selected', 'warning');
      return;
    }

    const file = e.target.files[0];

    if (file.size > env.VITE_MAX_ATTACHMENT_SIZE * ONE_MEGABYTE) {
      toast(
        `Sorry, but the selected file exceeds the ${env.VITE_MAX_ATTACHMENT_SIZE}MB limit.`,
        'warning'
      );
      return;
    }

    const form = await getCreateAttachmentFormWorkspace({
      workspaceId,
      fileName: file.name,
      fileType: file.type,
    });

    if (form.data?.getCreateAttachmentFormWorkspace == null) {
      toast('Sorry, an error occured :(. Try again later please!', 'error');
      return;
    }

    const attachForm = form.data.getCreateAttachmentFormWorkspace;

    const formData = new FormData();
    for (const { key, value } of attachForm.fields) {
      formData.set(key, value);
    }
    formData.set('file', file);

    const res = await axios.post(attachForm.url, formData, {
      onUploadProgress: (uploadProgress) => {
        setProgress((uploadProgress.loaded / uploadProgress.total!) * 100);
      },
    });

    if (res.status >= 400) {
      toast('Sorry, an error occured :(. Try again later please!', 'error');
      return;
    }

    const attachRes = await attachFileToWorkspace({
      handle: attachForm.handle,
    });

    if (attachRes.data?.attachFileToWorkspace == null) {
      toast('Sorry, an error occured :(. Try again later please!', 'error');
      return;
    }

    storage.incrementUsageBy(file.size / ONE_MEGABYTE);

    setProgress(undefined);

    afterUpload(attachRes.data.attachFileToWorkspace.url);
  };

  return { onAttachment, progress };
};

type OnImportUrlProps = {
  workspaceId: string;
  afterUpload?: (_: string) => void;
};

type OnImportUrlResult = {
  onImportUrl: (e: FormEvent<HTMLFormElement>) => Promise<void>;
};

export const useOnImportUrl = ({
  workspaceId,
  afterUpload = () => {},
}: OnImportUrlProps): OnImportUrlResult => {
  const [, createExternalDataSource] = useCreateExternalDataSourceMutation();
  const toast = useToast();

  const onImportUrl = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = (e.currentTarget.csvLink as unknown as HTMLInputElement).value;

    if (!url) {
      console.error('url not present');
      return;
    }

    const isCsv = await isCSV(url);

    if (!isCsv) {
      toast.error('Imported file is not a CSV.');
      return;
    }

    const datasource = await createExternalDataSource({
      dataSource: {
        workspaceId,

        externalId: url,
        provider: 'csv',

        name: url,
      },
    });

    const dataUrl = datasource.data?.createExternalDataSource?.externalId;
    if (dataUrl == null) {
      console.error('Data url returned is invalid');
      return;
    }

    afterUpload(dataUrl);
  };

  return { onImportUrl };
};
