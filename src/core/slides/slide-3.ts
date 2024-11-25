import type { RunContext } from "@/graphics/runtime";
import { Slide } from "../slide";

type Context = RunContext & {
};

export default class extends Slide<Context> {
  static title = '代码';

  constructor(index: number, title: string) {
    super(index, title, { touchable: true });
  }
}