/*
 * @Description: ref
 * @Author: Sunly
 * @Date: 2022-11-29 11:04:36
 */
import { hasChange, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class refImpl {
  private _refValue: any;
  _dep: Set<any>;
  private _rawValue;
  _v__isRef: true;
  constructor(refValue) {
    this._refValue = convert(refValue);
    this._dep = new Set();
    this._v__isRef = true;
  }
  get value() {
    if (isTracking()) {
      trackEffect(this._dep);
    }
    return this._refValue;
  }
  set value(value) {
    if (hasChange(value, this._rawValue)) {
      this._rawValue = value;
      this._refValue = convert(value);
      triggerEffect(this._dep);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(raw) {
  return new refImpl(raw);
}

export function isRef(raw) {
  return !!raw._v__isRef;
}

export function unRef(raw) {
  return isRef(raw) ? raw.value : raw;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    // 获取值的时候使用unRef，去掉value
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    // 设置值的时候，如果原来的值是ref而且新的值不是ref，直接修改.value
    // 否则，老值不是ref或者新值是ref，都直接使用setter
    set(target, key, newVal) {
      const oldVal = target[key];
      if (isRef(oldVal) && !isRef(newVal)) {
        oldVal.value = newVal;
        return true;
      } else {
        Reflect.set(target, key, newVal);
      }
      return true;
    },
  });
}
