/*
 * @Description: 渲染插槽
 * @Author: Sunly
 * @Date: 2022-12-09 14:37:46
 */
export function renderSlot(slot) {
  return Array.isArray(slot) ? slot : [slot];
}
