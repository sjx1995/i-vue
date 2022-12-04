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
  // 处理组件
  processComponent(vnode, container);
}

function processComponent(vnode, container) {
  if (typeof vnode.type === "string") {
    // 挂在元素
    mountElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // 挂载组件
    mountComponent(vnode, container);
  }
}

function mountElement(vnode, container) {
  console.log(vnode);
  const { type, props, children } = vnode;
  const el = document.createElement(type);
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

function mountComponent(vnode, container) {
  // 创建组件实例
  // 实例上会存储必要的属性
  const instance = createComponentInstance(vnode);

  // 初始化组件
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  patch(subTree, container);
}
