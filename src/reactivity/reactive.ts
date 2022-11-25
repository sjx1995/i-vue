/*
 * @Description: reactive
 * @Author: Sunly
 * @Date: 2022-11-25 02:22:38
 */
import { track, trigger } from "./effect";

export const enum ReactiveFlags {
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      if (key === ReactiveFlags.IS_READONLY) {
        return false;
      }
      const res = Reflect.get(target, key);
      // 追踪依赖
      track(target, key);
      return res;
    },
    set(target, key, newValue) {
      Reflect.set(target, key, newValue);
      // 触发依赖
      trigger(target, key);
      return true;
    },
  });
}

export function readonly(raw) {
  return new Proxy(raw, {
    get(target, key) {
      if (key === ReactiveFlags.IS_READONLY) {
        return true;
      }
      const res = Reflect.get(target, key);
      track(target, key);
      return res;
    },
    set(target) {
      console.warn(`${target}是 readonly 的，不能设置值`);
      return true;
    },
  });
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
