import { Color } from "three";

export function colorWith(color: Color | number | string): Color {
  if (typeof color === 'object') {
    return color;
  } else if (typeof color === 'number') {
    return new Color(color);
  } else if (color === 'none') {
    return new Color();
  }
  return new Color().setStyle(color);//.convertSRGBToLinear();
}


export const ColorDarkGray = colorWith('rgb(30, 31, 35)');