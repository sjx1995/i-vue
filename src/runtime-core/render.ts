/*
 * @Description: render
 * @Author: Sunly
 * @Date: 2022-12-01 02:56:33
 */
import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/shapeFlags";

export function render(vnode, container) {
  // 方便递归调用
  patch(vnode, container);
}

function patch(vnode, container) {
  const { shapeFlags } = vnode;
  if (shapeFlags & ShapeFlags.ELEMENT) {
    // 处理元素
    processElement(vnode, container);
  } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
    // 处理组件
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
  const { type, props, children, shapeFlags } = vnode;
  const el = document.createElement(type);
  vnode.el = el;
  if (props) {
    for (const key in props) {
      const value = props[key];
      const isOn = (str: string) => /^on[A-Z]/.test(str);
      if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, props[key]);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
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
  // 在instance上挂载vnode、type
  const instance = createComponentInstance(vnode);

  // 初始化组件
  // 挂载setupState
  // 挂载组件代理对象proxy
  // 挂载render
  setupComponent(instance);
  // 取出组件代理对象proxy，绑定其为this执行render
  setupRenderEffect(instance, vnode, container);
}

function setupRenderEffect(instance, vnode, container) {
  const { proxy } = instance;
  // 执行完render函数之后，返回的是根节点的vnode对象
  const subTree = instance.render.call(proxy);

  patch(subTree, container);

  vnode.el = subTree.el;
}
