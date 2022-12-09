/*
 * @Description: 处理slot
 * @Author: Sunly
 * @Date: 2022-12-09 14:34:16
 */
import { isObject } from "../shared/index";

export function initSlots(instance, slots) {
  if (isObject(slots)) {
    const obj = {};
    for (const key in slots) {
      const value = slots[key];
      obj[key] = Array.isArray(value) ? value : [value];
    }
    instance.slot = obj;
  }
}
