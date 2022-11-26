/*
 * @Description: effect
 * @Author: Sunly
 * @Date: 2022-10-15 21:06:59
 */
let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
  private _fn: (...args: any[]) => any;
  deps: any[];
  isActive = true;
  onStop?: () => void;
  constructor(fn) {
    this._fn = fn;
    this.deps = [];
  }
  run() {
    if (!this.isActive) {
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    return result;
  }
  stop() {
    if (this.isActive) {
      cleanup(this);
      this.isActive = false;
    }
  }
}

function cleanup(effect) {
  if (effect.onStop) {
    effect.onStop();
  }
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
}

const bucket = new WeakMap();
export function track(target, key) {
  if (!activeEffect) return;
  if (!shouldTrack) return;
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
