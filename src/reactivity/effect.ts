/*
 * @Description: effect
 * @Author: Sunly
 * @Date: 2022-10-15 21:06:59
 */
let activeEffect;
class ReactiveEffect {
  private _fn: (...args: any[]) => any;
  public options: any;
  constructor(fn, opt) {
    this._fn = fn;
    this.options = opt;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
}

const bucket = new WeakMap();
export function track(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
}

export function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const deps = depsMap.get(key);
  deps &&
    deps.forEach((effect) => {
      if (effect.options.scheduler) {
        effect.options.scheduler();
      } else {
        effect.run();
      }
    });
}

export function effect(fn, opt = {}) {
  const reactiveEffect = new ReactiveEffect(fn, opt);
  reactiveEffect.run();
  return fn;
}
