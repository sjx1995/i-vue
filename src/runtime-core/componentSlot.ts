/*
 * @Description: 处理slot
 * @Author: Sunly
 * @Date: 2022-12-09 14:34:16
 */
import { ShapeFlags } from "../shared/shapeFlags";

export function initSlots(instance, children) {
  const { shapeFlags } = instance;
  if (shapeFlags & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(instance.slots, children);
  }
}

function normalizeObjectSlots(slots, children) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
