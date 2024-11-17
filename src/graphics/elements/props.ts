// proxy
export const getProxyRawObject = Symbol('getProxyRawObject');

interface Observor {
  propGet(k: string): void;
  propSet(k: string, value: any): void;
}

export function propsProxy(props: any, observor: Observor) {
  return new Proxy(props, {
    get(target, p, receiver) {
      if (p === getProxyRawObject) {
        return target;
      }
      if (typeof p !== 'string') {
        return Reflect.get(target, p, receiver);
      }
      const names = p.split('.');
      if (names.length > 1) {
        let o: any = Reflect.get(target, names[0], receiver);
        for (let i = 1; i < names.length; i++) {
          o = o[names[i]];
        }
        return o;
      }
      observor.propGet(p);
      return Reflect.get(target, p, receiver);
    },
    set: (target, p, newValue, receiver) => {
      if (typeof p !== 'string') {
        return Reflect.set(target, p, newValue, receiver);
      }
      const ov = Reflect.get(target, p, receiver);
      if (ov === newValue) {
        return true;
      }
      let rv = true;
      const names = p.split('.');
      if (names.length > 1) {
        let o: any = Reflect.get(target, names[0], receiver);
        const lastName = names.pop() as string;
        for (let i = 1; i < names.length; i++) {
          o = o[names[i]];
        }
        if (o[lastName] === newValue) {
          return true;
        }
        observor.propSet(p, newValue);
        o[lastName] = newValue;
      } else {
        observor.propSet(p, newValue);
        rv = Reflect.set(target, p, newValue, target);
      }
      if (rv) {
        const { set } = Object.getOwnPropertyDescriptor((observor as any).__proto__, p) || {};
        if (set) {
          set.call(observor, newValue);
        }
      }
      return rv;
    }
  });
}