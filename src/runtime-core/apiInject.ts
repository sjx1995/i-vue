/*
 * @Description: provide / inject
 * @Author: Sunly
 * @Date: 2022-12-16 16:11:22
 */
import { getCurrentInstance } from "./component";

export function provide(key, val) {
  const instance = getCurrentInstance();
  if (instance) {
    let { provides } = instance;
    const parentProvides = instance.parent.provides;
    if (provides === parentProvides) {
      provides = Object.create(parentProvides);
      instance.provides = provides;
    }
    provides[key] = val;
  }
}

export function inject(key, defaultVal) {
  const instance = getCurrentInstance();
  if (instance) {
    const { provides } = instance.parent;
    if (key in provides) {
      return provides[key];
    } else {
      if (defaultVal != null) {
        if (typeof defaultVal === "function") {
          return defaultVal();
        }
        return defaultVal;
      }
    }
  }
}
