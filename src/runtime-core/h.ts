/*
 * @Description: h函数，对createVNode进行封装，方便调用
 * @Author: Sunly
 * @Date: 2022-12-04 19:40:29
 */
import { createVNode } from "./vnode";

export function h(type?, props?, children?) {
  return createVNode(type, props, children);
}
