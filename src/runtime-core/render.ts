/*
 * @Description: render
 * @Author: Sunly
 * @Date: 2022-12-01 02:56:33
 */
import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // 方便递归调用
  patch(vnode, container);
}

function patch(vnode, container) {
  if (typeof vnode.type === "string") {
    // 处理元素
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // 处理组件
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode;
  const el = document.createElement(type);
  vnode.el = el;
  if (props) {
    for (const key in props) {
      const value = props[key];
      el.setAttribute(key, value);
    }
  }
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.forEach((v) => {
    patch(v, container);
  });
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
  // 创建组件实例
  // 实例上会存储必要的属性
  const instance = createComponentInstance(vnode);

  // 初始化组件
  setupComponent(instance);
  setupRenderEffect(instance, vnode, container);
}

function setupRenderEffect(instance, vnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container);

  vnode.el = subTree.el;
}
