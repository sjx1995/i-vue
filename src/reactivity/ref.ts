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
