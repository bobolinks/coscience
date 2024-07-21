import { EventDispatcher } from "./utils/EventDispatcher";
import { Dragable } from "./utils/dragable";

export type GlobalEvent = 'loaded';
export type GlobalEventMap = {
  loaded: { type: 'loaded' };
};

function keyFormat(s: string) {
  const names = s.replace(/\s/mg, '').split('+');
  const keys = new Set();
  if (names.includes('meta')) keys.add('meta');
  if (names.includes('ctrl')) keys.add('ctrl');
  if (names.includes('alt')) keys.add('alt');
  if (names.includes('shift')) keys.add('shift');
  keys.add(names.pop());
  return [...keys].join('+');
}

type KeyListenerCallback = (e: KeyboardEvent) => void;
type KeyListener = {
  cb: KeyListenerCallback;
  group: string;
  own?: any;
};

export type KeyGroup = {
  enabled: boolean;
  keys: Record<string, string>;
};

export const global = new class extends EventDispatcher<GlobalEventMap> {
  // must not be null
  public dragable = null as any as Dragable;

  private _keydownListener: any;
  private _keydownListeners: Record<string, KeyListener> = {};
  private _keyupListener: any;
  private _keyupListeners: Record<string, KeyListener> = {};

  public readonly keyGroups: Record<string, KeyGroup> = {};

  constructor() {
    super();

    this._keydownListener = (e: any) => {
      this.onKeyDown(e);
    };

    this._keyupListener = (e: any) => {
      this.onKeyUp(e);
    };

    window.addEventListener('keydown', this._keydownListener);
    window.addEventListener('keyup', this._keyupListener);
  }

  dispose() {
    window.removeEventListener('keydown', this._keydownListener);
  }

  private hookDispatchEvent(dispatcher: EventDispatcher<any>) {
    if ((dispatcher as any)._orgDispatchEvent) {
      return;
    }
    (dispatcher as any)._orgDispatchEvent = dispatcher.dispatchEvent;
    const hook = (e: any) => {
      console.log('event forwarding', e);
      (dispatcher as any)._orgDispatchEvent.call(dispatcher, e);
      this.dispatchEvent(e);
    };
    (dispatcher as any).dispatchEvent = hook;
  }

  private unhookDispatchEvent(dispatcher: EventDispatcher<any>) {
    if (!(dispatcher as any)._orgDispatchEvent) {
      return;
    }
    (dispatcher as any).dispatchEvent = (dispatcher as any)._orgDispatchEvent;
    delete (dispatcher as any)._orgDispatchEvent;
  }

  addKeyDownListener(key: string, listener: Omit<KeyListener, 'group'> | KeyListenerCallback, groupPath: string) {
    const [group, title] = groupPath.split('.');
    key = keyFormat(key);
    const bound = this._keydownListeners[key];
    if (bound) {
      console.warn(`key[${key}] conflicted!`)
      return false;
    }
    const g = this.keyGroups[group] || (this.keyGroups[group] = { enabled: true, keys: {} });
    g.keys[key] = title;
    if (typeof listener === 'function') {
      listener = {
        cb: listener,
        group,
      } as KeyListener;
    } else {
      (listener as KeyListener).group = group;
    }
    this._keydownListeners[key] = listener as KeyListener;
  }

  removeKeyDownListener(key: string, cb: KeyListenerCallback) {
    key = keyFormat(key);
    const bound = this._keydownListeners[key];
    if (!bound || bound.cb !== cb) {
      return;
    }
    delete this._keydownListeners[key];
  }

  private onKeyDown(event: KeyboardEvent) {
    const keys = [];
    if (event.metaKey) {
      keys.push('meta');
    }
    if (event.ctrlKey) {
      keys.push('ctrl');
    }
    if (event.altKey) {
      keys.push('alt');
    }
    if (event.shiftKey) {
      keys.push('shift');
    }
    if (!keys.includes(event.key.toLocaleLowerCase())) {
      keys.push(event.key);
    }
    const key = keys.join('+');
    const bound = this._keydownListeners[key];
    if (!bound) {
      return;
    }
    const g = this.keyGroups[bound.group];
    if (!g.enabled) {
      return;
    }
    if (bound.own) {
      bound.cb.call(bound.own, event);
    } else {
      bound.cb(event);
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  addKeyUpListener(key: string, listener: Omit<KeyListener, 'group'> | KeyListenerCallback) {
    key = keyFormat(key);
    const bound = this._keyupListeners[key];
    if (bound) {
      console.warn(`key[${key}] conflicted!`)
      return false;
    }
    if (typeof listener === 'function') {
      listener = {
        cb: listener,
      } as KeyListener;
    }
    this._keyupListeners[key] = listener as KeyListener;
  }

  removeKeyUpListener(key: string, cb: KeyListenerCallback) {
    key = keyFormat(key);
    const bound = this._keyupListeners[key];
    if (!bound || bound.cb !== cb) {
      return;
    }
    delete this._keyupListeners[key];
  }

  private onKeyUp(event: KeyboardEvent) {
    const keys = [];
    if (event.metaKey) {
      keys.push('meta');
    }
    if (event.ctrlKey) {
      keys.push('ctrl');
    }
    if (event.altKey) {
      keys.push('alt');
    }
    if (event.shiftKey) {
      keys.push('shift');
    }
    if (!keys.includes(event.key.toLocaleLowerCase())) {
      keys.push(event.key);
    }
    const key = keys.join('+');
    const bound = this._keyupListeners[key];
    if (!bound) {
      return;
    }
    if (bound.own) {
      bound.cb.call(bound.own, event);
    } else {
      bound.cb(event);
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}
