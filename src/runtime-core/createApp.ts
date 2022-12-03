/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-12-01 02:35:15
 */
import { createVNode } from "./vnode";
import { render } from "./render";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 转换成虚拟节点，之后所有的操作都基于虚拟节点
      const vnode = createVNode(rootComponent);
      if (typeof rootContainer === "string") {
        rootContainer = document.querySelector(rootContainer);
      }
      render(vnode, rootContainer);
    },
  };
}
