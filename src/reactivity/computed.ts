/*
 * @Description: 计算属性
 * @Author: Sunly
 * @Date: 2022-11-29 17:14:46
 */
import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _effect;
  private _dirty: boolean;
  private _value: any;
  constructor(getter) {
    this._effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
    });
    this._dirty = true;
  }
  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
