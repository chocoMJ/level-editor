import {
  type RecognitionPayload,
  RecognitionPayloadSchema,
} from '@/models/level';

const RECOGNITIONS_ENDPOINT = '/api/recognitions';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const unwrapRecognitionResponse = (response: unknown) => {
  if (!isRecord(response)) {
    return response;
  }

  if ('items' in response) {
    return response.items;
  }

  if ('data' in response) {
    return response.data;
  }

  if ('payload' in response) {
    return response.payload;
  }

  return response;
};

const formatValidationError = (response: unknown) => {
  const candidates = Array.isArray(response) ? response : [response];
  const result = RecognitionPayloadSchema.array().safeParse(candidates);

  if (result.success) {
    return result.data;
  }

  const issue = result.error.issues[0];

  if (!issue) {
    throw new Error('Recognition response validation failed.');
  }

  throw new Error(
    `Recognition response validation failed: ${
      issue.path.join('.') || 'payload'
    }: ${issue.message}`,
  );
};

export const normalizeRecognitionResponse = (
  response: unknown,
): RecognitionPayload[] =>
  formatValidationError(unwrapRecognitionResponse(response));

export const uploadRecognitionImage = async (file: File) => {
  const formData = new FormData();

  formData.append('image', file);

  const response = await fetch(RECOGNITIONS_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Recognition upload failed: ${response.status} ${response.statusText}`,
    );
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw new Error('Recognition response JSON parse failed.');
  }

  return normalizeRecognitionResponse(responseBody);
};
