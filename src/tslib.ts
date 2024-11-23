import * as Monaco from 'monaco-editor';

const disposes: Record<string, Monaco.IDisposable> = {};

export async function init() {
  const files = await Promise.all(['code'].map((e) => fetch(`/types/${e}.d.ts`).then((ee) => ee.text())));
  files.forEach((e) => {
    Monaco.languages.typescript.typescriptDefaults.addExtraLib(e);
  });
}

export function addLib(cookie: string, code: string) {
  const d = Monaco.languages.typescript.typescriptDefaults.addExtraLib(code);
  disposes[cookie] = d;
}

export function clearLib(cookie: string) {
  const d = disposes[cookie];
  if (d) {
    d.dispose();
    delete disposes[cookie];
  }
}