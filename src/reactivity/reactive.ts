/*
 * @Description: reactive
 * @Author: Sunly
 * @Date: 2022-11-25 02:22:38
 */
import { mutableHandlers, readonlyHandlers } from "./baseHandler";

export const enum ReactiveFlags {
  IS_READONLY = "__v_isReadonly",
  IS_REACTIVE = "__v_isReactive",
}

function createReactiveObject(target, baseHandler) {
  return new Proxy(target, baseHandler);
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
