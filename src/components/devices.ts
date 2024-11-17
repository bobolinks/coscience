type ResolutionInfo = {
  value: string;
  label: string;
  dimension: {
    width: string;
    height: string;
  };
};

export type ResolutionName = 'auto' | '1080p' | '720p' | 'thumb';

type Resolutions = {
  [key in ResolutionName]: ResolutionInfo;
};

export const resolutions: Resolutions = {
  auto: {
    value: 'auto',
    label: '自适应',
    dimension: { width: '100%', height: '100%' },
  },
  '1080p': {
    value: '1080p',
    label: '1080p',
    dimension: { width: '1920px', height: '1080px' },
  },
  '720p': {
    value: '720p',
    label: '720p',
    dimension: { width: '1280px', height: '720px' },
  },
  'thumb': {
    value: 'thumb',
    label: '缩略图（360 x 240）',
    dimension: { width: '360px', height: '240px' },
  },
};

export const resoList = Object.keys(resolutions);

export default resolutions;
