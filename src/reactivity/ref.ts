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
  constructor(refValue) {
    this._refValue = convert(refValue);
    this._dep = new Set();
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
