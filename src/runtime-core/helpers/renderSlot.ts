/*
 * @Description: 渲染插槽
 * @Author: Sunly
 * @Date: 2022-12-09 14:37:46
 */
import { createVNode } from "../vnode";
import { Fragment } from "../vnode";

export function renderSlot(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === "function") {
      return createVNode(Fragment, {}, [slot(props)]);
    }
  }
}
