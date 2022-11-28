/*
 * @Description: proxy对象的handler
 * @Author: Sunly
 * @Date: 2022-11-25 10:02:51
 */
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { extend, isObject } from "../shared/index";

function createGetter(isReadonly = false, isShallow = false) {
  return function (target, key) {
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }
    const res = Reflect.get(target, key);
    if (isShallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}

export function createSetter() {
  return function (target, key, newValue) {
    Reflect.set(target, key, newValue);
    trigger(target, key);
    return true;
  };
}

export const mutableHandlers = {
  get: createGetter(),
  set: createSetter(),
};

export const readonlyHandlers = {
  get: createGetter(true),
  set(target) {
    console.warn(`${target}是 readonly 的，不能设置值`);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: createGetter(true, true),
});
