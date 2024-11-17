import sys from './sys';

type ResponseType = XMLHttpRequestResponseType | 'jsonstream';
export type RequestOptions = Pick<Request, 'cache' | 'credentials' | 'keepalive' | 'method' | 'mode' | 'credentials'> & {
  url: string;
  responseType: ResponseType;
  headers: Record<string, string>;
  body: any;
  cacheHash: string;
};

const decoder = new TextDecoder();

const cache = await caches.open('darts');

let id = 0;

export default {
  async request<T = any>(request: (Partial<RequestOptions> & { url: string }) | string): Promise<T> {
    const url = typeof request === 'string' ? request : request.url;
    const ops: Partial<RequestOptions> = typeof request === 'string' ? {} : request;
    const responseType: ResponseType = ops.responseType || 'json';
    const cacheHash = ops.cacheHash;

    if (cacheHash) {
      const rsp = await cache.match(cacheHash);
      if (rsp) {
        if (responseType === 'arraybuffer') {
          return rsp.arrayBuffer() as any;
        } else if (responseType === 'json') {
          return rsp.json();
        }
        return rsp.text() as any;
      }
    }

    delete ops.url;
    delete ops.responseType;
    delete ops.cacheHash;

    const headers = new Headers();
    if (ops.headers) {
      Object.entries(ops.headers).forEach(([k, v]) => headers.set(k, v));
    }
    ops.headers = headers as any;
    if (ops.body) {
      const bty = typeof ops.body;
      if (bty === 'object') {
        headers.set('Content-Type', 'application/json');
      }
      if (bty !== 'string') {
        ops.body = JSON.stringify(ops.body);
      }
    }

    const rsp = await fetch(new Request(url, ops));
    if (cacheHash) {
      cache.put(cacheHash, rsp.clone());
    }
    if (responseType === 'arraybuffer') {
      return rsp.arrayBuffer() as any;
    } else if (responseType === 'json') {
      return rsp.json();
    } else if (responseType === 'jsonstream') {
      return rsp.body as any;
    }
    return rsp.text() as any;
  },
  async stream(request: (Partial<RequestOptions> & { url: string }) | string, cb: (message: any) => void): Promise<boolean> {
    const stream: ReadableStream<Uint8Array> = await this.request(request);
    const reader = stream.getReader();
    let tail = '';
    let chunk;
    while ((chunk = await reader.read()) !== null) {
      if (!chunk.value) {
        await sys.wait(100);
        continue;
      }
      const sChunk = decoder.decode(chunk.value);
      const lines = sChunk.split('\n');
      if (tail) {
        lines[0] = `${tail}${lines[0]}`;
        tail = '';
      }
      for (const line of lines) {
        let json: any;
        try {
          json = JSON.parse(line);
        } catch (e) {
          tail = line;
          break;
        }
        if (!json) {
          continue;
        }
        cb(json);
      }
    }
    return true;
  },
  requestSync(request: (Partial<RequestOptions> & { url: string }) | string) {
    const url = typeof request === 'string' ? request : request.url;
    const ops: Partial<RequestOptions> = typeof request === 'string' ? {} : (request as any);
    const xhr = new XMLHttpRequest();
    xhr.open(ops.method || 'GET', url, false);
    if (ops.headers) {
      for (const [k, v] of Object.entries(ops.headers)) {
        xhr.setRequestHeader(k, v);
      }
    }
    xhr.withCredentials = true;
    xhr.onerror = (ev) => {
      throw ev;
    };
    let result = null;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        result = xhr.responseText || xhr.responseXML || xhr.response;
      }
    };
    if (typeof ops.body === 'object' && ops.body instanceof ArrayBuffer && (!ops.headers || !ops.headers['Content-Type'])) {
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send(ops.body);
    } else {
      xhr.send(ops.body || null);
    }
    if (xhr.status !== 200) {
      throw new Error(xhr.responseText);
    }
    return result;
  },
  async rpcCall(request: (Partial<Omit<RequestOptions, 'method' | 'body'>> & { url: string }) | string, ...params: Array<any>) {
    if (typeof request === 'string') {
      request = { url: request } as any;
    }
    const body = {
      jsonrpc: '2.0',
      id: id++,
      method: '',
      params
    };
    let rs = (await this.request({ ...(request as any), body, method: 'POST' })) as any;
    if (typeof rs === 'string') {
      rs = JSON.parse(rs);
    }
    return rs.result;
  },
  rpcCallSync(request: (Omit<Request, 'method' | 'data'> & { url: string }) | string, ...params: Array<any>) {
    if (typeof request === 'string') {
      request = { url: request } as any;
    }
    const body = {
      jsonrpc: '2.0',
      id: id++,
      method: '',
      params
    };
    const headers = {
      'Content-Type': 'application/json',
      ...(request as any).headers
    };
    let rs = this.requestSync({ ...(request as any), body: JSON.stringify(body), method: 'POST', headers }) as any;
    if (typeof rs === 'string') {
      rs = JSON.parse(rs);
    }
    return rs.result;
  }
};
