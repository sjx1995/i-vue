/*
 * @Description: reactive
 * @Author: Sunly
 * @Date: 2022-11-25 02:22:38
 */
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandler";
import { isObject } from "../shared/index";

export const enum ReactiveFlags {
  IS_READONLY = "__v_isReadonly",
  IS_REACTIVE = "__v_isReactive",
}

function createReactiveObject(target, baseHandler) {
  if (!isObject(target)) {
    console.warn(target`${target} 必须是一个对象`);
    return target;
  }
  return new Proxy(target, baseHandler);
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers);
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
