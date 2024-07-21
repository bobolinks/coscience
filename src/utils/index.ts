/* eslint-disable complexity */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
export { default as Logger } from './logger';
export { default as Sys } from './sys';

const chars = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'];

export const Utils = {
  randomBetween(max: number, min = 0) {
    return Math.round(Math.random() * (max - min)) + min;
  },
  randomChoice<T>(obj: T[]): T {
    if (Array.isArray(obj)) {
      const i = Math.floor(Math.random() * obj.length);
      return obj[i];
    } else {
      const list = Object.keys(obj);
      const key = Math.floor(Math.random() * list.length);
      return obj[key];
    }
  },
  randomHash(randomFlag: boolean, min: number, max: number) {
    let str = '';
    let range = min;
    // 随机产生
    if (randomFlag) {
      range = Math.round(Math.random() * (max - min)) + min;
    }
    for (let i = 0; i < range; i++) {
      const pos = Math.round(Math.random() * (chars.length - 1));
      str += chars[pos];
    }
    return str;
  },
  randomWords(length: number, set?: string | Array<string>) {
    let str = '';
    if (set && typeof set === 'string') {
      set = [...set];
    }
    const wset = set || chars;
    for (let i = 0; i < length; i++) {
      const pos = Math.round(Math.random() * (wset.length - 1));
      str += wset[pos];
    }
    return str;
  },

  fieldsCopy(dst: { [x: string]: any; }, src: { [x: string]: any; }, keys: Array<string> | undefined) {
    keys = keys || Object.keys(src);
    keys.forEach(k => {
      dst[k] = src[k];
    });
  },

  formatTime(date: { format: (arg0: string) => any; }) {
    if (!date) {
      return '';
    }
    return date.format('yyyy-MM-dd hh:mm:ss');
  },

  formatDate(date: { format: (arg0: string) => any; }) {
    if (!date) {
      return '';
    }
    return date.format('yyyy-MM-dd');
  },

  isDateIn(base: number, to: number, days: number) {
    return Math.floor((to - base) / 86400000) <= days;
  },

  isTimeIn(t: number, seconds: number) {
    return (Date.now() - t) <= (seconds * 1000);
  },

  timeLeft(ms: number) {
    let secs = Math.ceil(ms / 1000);
    const days = Math.floor(secs / 86400);
    secs %= 86400;
    const hours = Math.floor(secs / 3600);
    secs %= 3600;
    const mins = Math.floor(secs / 60);
    secs %= 60;
    const ps: Array<string> = [];
    if (days) {
      ps.push(`${days}天`);
    } if (hours) {
      ps.push(`${hours}小时`);
    } if (mins) {
      ps.push(`${mins}分`);
    } if (secs) {
      ps.push(`${secs}秒`);
    }
    return ps.join('');
  },

  timeLeftStd(ms: number) {
    let secs = Math.ceil(ms / 1000);
    const hours = Math.floor(secs / 3600).toString().padStart(2, '0');
    secs %= 3600;
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    secs %= 60;
    return `${hours.toString()}:${mins}′${secs.toString().padStart(2, '0')}″`;
  },

  timeLeftSim(ms: number) {
    let secs = Math.round(ms / 1000);
    const hours = Math.floor(secs / 3600).toString().padStart(2, '0');
    secs %= 3600;
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    secs %= 60;
    return `${hours.toString()}:${mins}:${secs.toString().padStart(2, '0')}`;
  },

  timeLeftSht(ms: number) {
    const msv = ms % 1000;
    const mss = msv ? `.${Math.ceil(msv / 10)}` : '';
    let secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    secs %= 60;
    return `${mins}′${secs.toString().padStart(2, '0')}${mss}″`;
  },

  timeLeftShtCh(ms: number) {
    const msv = ms % 1000;
    const mss = msv ? `.${Math.ceil(msv / 10)}` : '';
    let secs = Math.floor(ms / 1000);
    let mins: any = Math.floor(secs / 60);
    if (mins) {
      mins = `${mins}分`;
    } else {
      mins = '';
    }
    secs %= 60;
    return `${mins}${secs.toString()}${mss}秒`;
  },

  arrayShuffle(ar: Array<any>) {
    let c = ar.length;
    while (c) {
      const i = this.randomBetween(--c);
      const t = ar[c];
      ar[c] = ar[i];
      ar[i] = t;
    }
    return ar;
  },

  toCamelString(s: string) {
    return s.replace(/[-_](\w)/g, (all, letter) => letter.toUpperCase()).replace(/^\w/, (all) => all.toLowerCase());
  },
};