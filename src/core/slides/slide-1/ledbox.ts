import { Group } from "three/webgpu";
import { Model, type ModelProps } from "@/graphics/elements/model";
import { White } from "@/core/theme";
import { colorWith } from "@/graphics/utils";
import { Led } from "@/graphics/elements/led";

type LedProps = ModelProps & {
  intensity: number;
  color: ColorType;
};

export class LedBox extends Model<Group, LedProps> {
  private light: Led;

  constructor(model: Group, props: Partial<LedProps>) {
    super(model, { color: White, intensity: 1, size: 1, ...props } as any);

    this.model.position.set(0, 0, 0);

    const size = this.props.size * 0.99;
    this.light = new Led({ width: size, height: size, ...this.props });
    this.light.rotation.x = Math.PI / 2;
    this.light.position.y = 0.04 * size;
    this.add(this.light);
  }

  protected set color(value: ColorType) {
    if (this.light) {
      this.light.props.color = colorWith(value);
    }
  }

  protected set intensity(value: number) {
    if (this.light) {
      this.light.props.intensity = value;
    }
  }
}
