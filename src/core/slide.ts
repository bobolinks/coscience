import { Camera, Mesh, Scene } from "three";

export class Slide extends Scene {
  protected viewSize: { width: number; height: number } = { width: 1, height: 1 };

  public offsetX = 0;
  public offsetY = 0;

  protected contentWidth = 0;
  protected contentHeight = 0;

  handleWheel(deltaX: number, deltaY: number): boolean {
    const offsetX = Math.max(0, Math.min(this.offsetX + deltaX, this.contentWidth));
    const offsetY = Math.max(0, Math.min(this.offsetY + deltaY, this.contentHeight));

    if (Math.abs(offsetX - this.offsetX) >= 0.0001 || Math.abs(offsetY - this.offsetY) >= 0.0001) {
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      return true;
    }

    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDblClick(x: number, y: number) {
    // do nothing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseDown(x: number, y: number) {
    // do nothing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseUp(x: number, y: number) {
    // do nothing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseMove(x: number, y: number) {
    // do nothing
  }

  update(camera: Camera, delta: number, now: number) {
    // do nothing
  }

  resize(width: number, height: number) {
    this.viewSize.height = height;
    this.viewSize.width = width;
  }

  dispose() {
    this.traverse(child => {
      if (child instanceof Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach(e => e.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
        if (child.geometry) {
          child.geometry.dispose();
        }
      }
    });
  }
}