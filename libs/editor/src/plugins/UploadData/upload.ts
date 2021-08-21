import { ApolloClient, InMemoryCache } from '@apollo/client';
import {
  GET_CREATE_ATTACHMENT_FORM,
  ATTACH_FILE_TO_PAD,
} from '@decipad/queries';

interface Field {
  key: string;
  value: string;
}

interface CreateFormResponse {
  url: string;
  handle: string;
  fields: Field[];
}

export async function getCreateForm({
  padId,
  fileName,
  fileType,
}: {
  padId: string;
  fileName: string;
  fileType: string;
}): Promise<CreateFormResponse> {
  const client = getClient();
  const { data } = await client.query({
    query: GET_CREATE_ATTACHMENT_FORM,
    variables: {
      padId,
      fileName,
      fileType,
    },
  });

  return data.getCreateAttachmentForm;
}

export async function postForm(
  file: File,
  formData: CreateFormResponse
): Promise<void> {
  const form = new FormData();
  for (const { key, value } of formData.fields) {
    form.append(key, value);
  }

  form.append('file', file);

  await fetch(formData.url, {
    method: 'POST',
    body: form,
  });
}

export async function attachFile(
  formData: CreateFormResponse
): Promise<{ url: string }> {
  const client = getClient();
  const { data } = await client.mutate({
    mutation: ATTACH_FILE_TO_PAD,
    variables: {
      handle: formData.handle,
    },
  });

  return { url: data.attachFileToPad.url };
}

function getClient() {
  return new ApolloClient({
    uri: '/graphql',
    cache: new InMemoryCache(),
  });
}
