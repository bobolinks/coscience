import * as Monaco from 'monaco-editor';

const disposes: Record<string, Monaco.IDisposable> = {};

export async function init() {
  const files = await Promise.all(['slide'].map((e) => fetch(`/types/${e}.d.ts`).then((ee) => ee.text())));
  files.forEach((e) => {
    Monaco.languages.typescript.javascriptDefaults.addExtraLib(e);
  });
}

export function addLib(cookie: string, code: string) {
  const d = Monaco.languages.typescript.javascriptDefaults.addExtraLib(code);
  disposes[cookie] = d;
}

export function clearLib(cookie: string) {
  const d = disposes[cookie];
  if (d) {
    d.dispose();
    delete disposes[cookie];
  }
}