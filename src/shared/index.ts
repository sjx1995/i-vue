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

export function hasOwn(val, key) {
  return Object.prototype.hasOwnProperty.call(val, key);
}

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const toHandlerKey = (str: string) =>
  str ? "on" + capitalize(str) : "";

export const EMPTY_OBJECT = {};
