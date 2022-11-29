import { extend } from "../shared";

/*
 * @Description: effect
 * @Author: Sunly
 * @Date: 2022-10-15 21:06:59
 */
let activeEffect;
let shouldTrack = false;
export class ReactiveEffect {
  private _fn: (...args: any[]) => any;
  deps: any[];
  isActive = true;
  onStop?: () => void;
  scheduler?: Function;
  constructor(fn, scheduler?: Function) {
    this.scheduler = scheduler;
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
  effect.deps.length = 0;
}

const bucket = new WeakMap();
export function track(target, key) {
  if (!isTracking()) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffect(dep);
}

export function trackEffect(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  triggerEffect(dep);
}

export function triggerEffect(dep) {
  dep &&
    dep.forEach((effect) => {
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

export function effect(fn, opt: any = {}) {
  const reactiveEffect = new ReactiveEffect(fn, opt.scheduler);
  extend(reactiveEffect, opt);
  reactiveEffect.run();
  const runner: any = reactiveEffect.run.bind(reactiveEffect);
  runner.effect = reactiveEffect;
  return runner;
}
