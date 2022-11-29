/*
 * @Description: 共享的方法
 * @Author: Sunly
 * @Date: 2022-11-27 00:36:18
 */
export function isObject(value) {
  return value !== null && typeof value === "object";
}

export const extend = Object.assign;

export function hasChange(newVal, oldVal) {
  return !Object.is(newVal, oldVal);
}
