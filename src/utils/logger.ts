/* eslint-disable prefer-spread */
/* eslint-disable no-nested-ternary */

export default {
  debug(...args: any[]) {
    console.debug(...args);
  },
  info(...args: any[]) {
    console.log(...args);
  },
  warn(...args: any[]) {
    console.warn(...args);
  },
  error(...args: any[]) {
    console.error(...args);
  },
  panic(...args: any[]) {
    console.error(...args);
  },
};
