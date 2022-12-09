/*
 * @Description: 渲染插槽
 * @Author: Sunly
 * @Date: 2022-12-09 14:37:46
 */
export function renderSlot(slots, name) {
  const slot = slots[name];
  if (slot) {
    return slot;
  }
}
