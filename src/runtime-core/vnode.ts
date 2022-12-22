/*
 * @Description: vnode
 * @Author: Sunly
 * @Date: 2022-12-01 02:41:30
 */
import { ShapeFlags } from "../shared/shapeFlags";

export const Fragment = Symbol("fragment");
export const Text = Symbol("Text");

// 如果是component，那么type值是一个对象，里面包含了setup()、render()等函数
// 如果是element，那么type值是一个标签名
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    key: props && props.key,
    children,
    el: null,
    shapeFlags: getShapeFlag(type),
  };

  if (typeof children === "string") {
    vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN;
  }

  // vnode是个组件，而且第三个参数是对象，说明是个插槽
  if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlags |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

export function createTextNode(text: string) {
  return createVNode(Text, {}, text);
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
