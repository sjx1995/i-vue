/*
 * @Description: effect
 * @Author: Sunly
 * @Date: 2022-10-15 21:06:59
 */
let activeEffect;
class ReactiveEffect {
  private _fn: (...args: any[]) => any;
  deps: any[];
  constructor(fn) {
    this._fn = fn;
    this.deps = [];
  }
  run() {
    activeEffect = this;
    const result = this._fn();
    return result;
  }
  stop() {
    this.deps.forEach((dep) => {
      dep.delete(this);
    });
  }
}

const bucket = new WeakMap();
export function track(target, key) {
  if (!activeEffect) return;
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
  activeEffect.deps.push(deps);
}

export function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const deps = depsMap.get(key);
  deps &&
    deps.forEach((effect) => {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect.run();
      }
    });
}

export function stop(fn) {
  console.log("stop");
  fn.effect.stop();
}

export function effect(fn, opt = {}) {
  const reactiveEffect = new ReactiveEffect(fn);
  Object.assign(reactiveEffect, opt);
  reactiveEffect.run();
  const runner: any = reactiveEffect.run.bind(reactiveEffect);
  runner.effect = reactiveEffect;
  return runner;
}
