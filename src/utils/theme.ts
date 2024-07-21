export default {
  setTheme(name: string) {
    const e = document.getElementById('themeStyle') as HTMLLinkElement;
    e.href = e.href.replace(/\/([^/]+)\.css$/, `/${name}.css`);
  },
};
