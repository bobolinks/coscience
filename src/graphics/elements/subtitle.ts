import { Text } from "./text";

type AlignType = 'top' | 'center' | 'bottom';

export class SubTitle extends Text {
  private align: AlignType = 'center';
  private screenSize = { width: 0, height: 0 };

  alignTo(align: AlignType) {
    if (this.align !== align) {
      this.align = align;
    }
    if (align === 'center') {
      this.position.set(0, 0, 0);
    } else if (align === 'bottom') {
      this.position.y = -this.screenSize.height / 2.5;
    } else {
      this.position.y = this.screenSize.height / 2.5;
    }
  }
  resize(width: number, height: number) {
    this.screenSize.width = width;
    this.screenSize.height = height;
    if (this.align !== 'center') {
      this.alignTo(this.align);
    }
  }
}
