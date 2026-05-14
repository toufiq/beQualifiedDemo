import type { TestInfo } from '@playwright/test';

export const attachJson = async (info: TestInfo, name: string, data: unknown) => {
  await info.attach(name, {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json'
  });
};

export const attachText = async (info: TestInfo, name: string, text: string) => {
  await info.attach(name, {
    body: text,
    contentType: 'text/plain'
  });
};
