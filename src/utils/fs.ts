import net from './net';

export const encoder = new TextEncoder();

export class LocalFileSystem {
  static init(root: string): LocalFileSystem {
    const isExs = net.rpcCallSync(`/fs/exists/${root}`, root);
    if (!isExs) {
      const rs = net.rpcCallSync(`/fs/mkdir/${root}`, root);
      if (!rs) {
        throw 'fs error';
      }
    }
    return new LocalFileSystem(root);
  }

  constructor(private root: string) {}

  exists(p: string) {
    const pp = `${this.root}/${p}`;
    return net.rpcCallSync(`/fs/exists/${pp}`, pp);
  }

  ls(p: string): Array<[string, { isd: boolean; size: number }]> {
    const pp = `${this.root}/${p}`;
    return net.rpcCallSync(`/fs/ls/${pp}`, pp);
  }

  rename(p: string, newPath: string) {
    const pp = `${this.root}/${p}`;
    const pn = `${this.root}/${newPath}`;
    return net.rpcCallSync(`/fs/rename/${pp}`, pp, pn);
  }

  mkdir(p: string, subs: Array<string>) {
    const pp = `${this.root}/${p}`;
    return net.rpcCallSync(`/fs/mkdir/${pp}`, pp, subs);
  }

  rm(p: string) {
    const pp = `${this.root}/${p}`;
    return net.rpcCallSync(`/fs/rm/${pp}`, pp);
  }

  read(p: string, opt?: { encoding: 'utf8' | 'binary' }): string | ArrayBuffer {
    const pp = `${this.root}/${p}`;
    return net.requestSync({
      url: `/fs/read/${p}`,
      body: JSON.stringify([pp, opt]),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }) as any;
  }

  write(p: string, data: string | ArrayBuffer | object) {
    if (typeof data === 'object' && !(data instanceof ArrayBuffer)) {
      data = encoder.encode(JSON.stringify(data)).buffer;
    }
    const pp = `${this.root}/${p}`;
    if (typeof data === 'string') {
      return net.requestSync({
        url: `/fs/write/${pp}`,
        body: [data],
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return net.requestSync({
        url: `/fs/write/${pp}`,
        body: data,
        method: 'POST'
      });
    }
  }
}
