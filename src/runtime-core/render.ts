/*
 * @Description: render
 * @Author: Sunly
 * @Date: 2022-12-01 02:56:33
 */
import { createAppApi } from "./createApp";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/shapeFlags";
import { Fragment, Text } from "./vnode";
import { effect } from "../reactivity/effect";
import { EMPTY_OBJECT } from "../shared";

export function createRenderer(options) {
  function render(vnode, container) {
    // 方便递归调用
    patch(null, vnode, container, null);
  }

  const { createElement, patchProp, insert, remove, setElementText } = options;

  function patch(n1, n2, container, parent) {
    const { type, shapeFlags } = n2;
    switch (type) {
      case Fragment:
        mountChildren(n2.children, container, parent);
        break;

      case Text:
        processTextNode(n1, n2, container);
        break;

      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          // 处理元素
          processElement(n1, n2, container, parent);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parent);
        }
        break;
    }
  }

  function processTextNode(n1, n2, container) {
    const textNode = document.createTextNode(n2.children);
    n2.el = textNode;
    container.append(textNode);
  }

  function processElement(n1, n2, container, parent) {
    if (!n1) {
      mountElement(n2, container, parent);
    } else {
      patchElement(n1, n2, container, parent);
    }
  }

  function patchElement(n1, n2, container, parent) {
    console.log("patch element");
    console.log(n1);
    console.log(n2);

    const oldProps = n1.props || EMPTY_OBJECT;
    const newProps = n2.props || EMPTY_OBJECT;

    const el = n1.el;
    n2.el = el;

    patchChildren(n1, n2, el, parent);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parent) {
    const { shapeFlags: prevShapeFlag } = n1;
    const { children: prevChildren } = n1;
    const { shapeFlags: nextShapeFlag } = n2;
    const { children: nextChildren } = n2;

    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 数组节点 -> 文字节点
        unmountChildren(prevChildren);
        setElementText(container, nextChildren);
      } else {
        // todo 数组节点->数组节点，要使用diff算法
      }
    } else {
      // 文字节点 -> 文字节点
      if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        setElementText(container, nextChildren);
      } else {
        // 文字节点 -> 数组节点
        setElementText(container, "");
        mountChildren(nextChildren, container, parent);
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      remove(child);
    }
  }

  function patchProps(el, oldProps, newProps) {
    for (const key in newProps) {
      const oldVal = oldProps[key];
      const newVal = newProps[key];

      if (newVal !== oldVal) {
        patchProp(el, key, oldVal, newVal);
      }
    }

    if (oldProps !== EMPTY_OBJECT) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          patchProp(el, key, oldProps[key], null);
        }
      }
    }
  }

  function mountElement(vnode, container, parent) {
    const { type, props, children, shapeFlags } = vnode;
    // cerate element
    const el = createElement(type);
    vnode.el = el;
    // set attribute
    if (props) {
      for (const key in props) {
        const value = props[key];
        // set prop
        patchProp(el, key, null, value);
      }
    }
    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parent);
    }
    // insert
    insert(el, container);
  }

  function mountChildren(children, container, parent) {
    children.forEach((v) => {
      patch(null, v, container, parent);
    });
  }

  function processComponent(n1, n2, container, parent) {
    mountComponent(n2, container, parent);
  }

  function mountComponent(vnode, container, parent) {
    // 创建组件实例
    // 实例上会存储必要的属性
    // 在instance上挂载vnode、type
    const instance = createComponentInstance(vnode, parent);

    // 初始化组件
    // 挂载setupState
    // 挂载组件代理对象proxy
    // 挂载render
    setupComponent(instance);
    // 取出组件代理对象proxy，绑定其为this执行render
    setupRenderEffect(instance, vnode, container);
  }

  function setupRenderEffect(instance, vnode, container) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        // 执行完render函数之后，返回的是根节点的vnode对象
        const subTree = instance.render.call(proxy);
        instance.subTree = subTree;

        patch(null, subTree, container, instance);

        vnode.el = subTree.el;

        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        // 执行完render函数之后，返回的是根节点的vnode对象
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;

        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAppApi(render),
  };
}
