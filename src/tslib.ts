import * as Monaco from 'monaco-editor';

export async function init() {
  const files = await Promise.all(['code'].map((e) => fetch(`/types/${e}.d.ts`).then((ee) => ee.text())));
  files.forEach((e) => {
    Monaco.languages.typescript.typescriptDefaults.addExtraLib(e);
  });
}
