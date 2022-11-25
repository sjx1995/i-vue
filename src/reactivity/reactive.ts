/*
 * @Description: reactive
 * @Author: Sunly
 * @Date: 2022-11-25 02:22:38
 */
import { track, trigger } from "./effect";

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      // 追踪依赖
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, newValue) {
      Reflect.set(target, key, newValue);
      // 触发依赖
      trigger(target, key);
      return true;
    },
  });
}
