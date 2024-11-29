import { BufferGeometry, Color, Group, Mesh, MeshBasicMaterial, Object3D } from "three/webgpu";
import type { AttrsLike } from "@/graphics/elements/element";
import { Model, type ModelProps } from "@/graphics/elements/model";
import { Sound } from "@/graphics/elements/sound";
import { Blue, Green } from "@/core/theme";
import { colorWith } from "@/graphics/utils";

type Attrs = AttrsLike & {
  depth: number;
};

export class Button extends Model<Group, ModelProps, Attrs> {
  public isDown = false;

  private touch: Object3D;
  private sound: Sound;
  private red: Color;
  private green = colorWith(Blue);
  private material: MeshBasicMaterial;

  constructor(model: Group, props: ModelProps) {
    super(model, { touchable: true, ...props });

    this.model.position.set(0, 0, 0);

    this.touch = model.getObjectByName('Touch') as any;
    this.material = (this.touch.children[0] as any as Mesh<BufferGeometry, MeshBasicMaterial>).material;
    this.red = this.material.color;
    this.sound = new Sound({});
    this.on('tap', () => {
      this.press();
    });
  }

  protected get depth() {
    return this.touch.position.y;
  }

  protected set depth(value: number) {
    this.touch.position.y = value;
  }

  async press(): Promise<void> {
    this.sound.playSound('/assets/sounds/press.mp3');
    if (this.isDown) {
      this.isDown = false;
      this.material.color = this.red;
      await this.startAnimation({ depth: 0 }, 200);
    } else {
      this.isDown = true;
      await this.startAnimation({ depth: -0.01 }, 200);
      this.material.color = this.green;
    }
  }
}
