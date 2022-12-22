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
import { shouldUpdateComponent } from "./componentUpdateUtils";

export function createRenderer(options) {
  function render(vnode, container) {
    // 方便递归调用
    patch(null, vnode, container, null, null);
  }

  const { createElement, patchProp, insert, remove, setElementText } = options;

  function patch(n1, n2, container, parent, anchor) {
    const { type, shapeFlags } = n2;
    switch (type) {
      case Fragment:
        mountChildren(n2.children, container, parent, anchor);
        break;

      case Text:
        processTextNode(n1, n2, container);
        break;

      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          // 处理元素
          processElement(n1, n2, container, parent, anchor);
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

  function processElement(n1, n2, container, parent, anchor) {
    if (!n1) {
      mountElement(n2, container, parent, anchor);
    } else {
      patchElement(n1, n2, container, parent, anchor);
    }
  }

  function patchElement(n1, n2, container, parent, anchor) {
    const oldProps = n1.props || EMPTY_OBJECT;
    const newProps = n2.props || EMPTY_OBJECT;

    const el = n1.el;
    n2.el = el;

    patchChildren(n1, n2, el, parent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parent, anchor) {
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
        // 数组节点 -> 数组节点
        patchKeyedChildren(prevChildren, nextChildren, container, parent);
      }
    } else {
      // 文字节点 -> 文字节点
      if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        setElementText(container, nextChildren);
      } else {
        // 文字节点 -> 数组节点
        setElementText(container, "");
        mountChildren(nextChildren, container, parent, anchor);
      }
    }
  }

  function isSameNode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }

  function patchKeyedChildren(prevChildren, nextChildren, container, parent) {
    let i = 0;
    let e1 = prevChildren.length - 1;
    let e2 = nextChildren.length - 1;

    // 左侧对比
    while (i <= e1 && i <= e2) {
      const n1 = prevChildren[i];
      const n2 = nextChildren[i];

      if (isSameNode(n1, n2)) {
        patch(n1, n2, container, parent, null);
      } else {
        break;
      }

      i++;
    }

    // 右侧对比
    while (i <= e1 && i <= e2) {
      const n1 = prevChildren[e1];
      const n2 = nextChildren[e2];

      if (isSameNode(n1, n2)) {
        patch(n1, n2, container, parent, null);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    // 新的比旧的长，新增
    // i比旧节点的尾指针大，说明旧节点已经遍历完了
    // i不比新节点的尾指针大，说明新节点有没有对比的，i到e2的这些节点就是新增的
    if (e1 < i && e2 >= i) {
      const nextPos = e2 + 1;
      let anchor = null;
      if (nextPos < nextChildren.length) {
        anchor = nextChildren[nextPos].el;
      }
      while (i <= e2) {
        const el = nextChildren[i];
        patch(null, el, container, parent, anchor);
        i++;
      }
    }

    // 新的比旧的短，删除
    // i比新节点的尾指针大，说明新节点已经全部遍历完了
    // i没有比旧节点的尾指针大，说明旧节点存在没有对比的，i到e1的这些节点就是要删除的
    else if (i <= e1 && i > e2) {
      while (i <= e1) {
        remove(prevChildren[i].el);
        i++;
      }
    }

    // 对首尾进行预处理后，就锁定了中间的乱序部分
    else {
      let s1 = i;
      let s2 = i;

      const toBePatchedCount = e2 - s2 + 1;
      let patchedCount = 0;

      // 创建新节点{key:index}的映射
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        const key = nextChildren[i].key;
        if (key != null) {
          keyToNewIndexMap.set(key, i);
        }
      }

      // 创建一个数组：如果新节点复用了旧节点，那么在新节点对应的下标位置保存其在旧节点中的索引
      const newIndexToOldIndexMap = new Array(toBePatchedCount);
      newIndexToOldIndexMap.fill(-1);

      // 遍历旧节点时，每次找到其在新节点中的index，如果index始终递增，则说明保持了相对的顺序，不需要移动
      // k就是保存这个当前的最大索引，一旦新节点index小于k，则说明需要移动
      let k = 0;
      let needMove = false;

      for (let i = s1; i <= e1; i++) {
        const prevChild = prevChildren[i];

        // 当新节点已经全部patch，就没有必要比较旧节点，全部删除即可
        if (patchedCount >= toBePatchedCount) {
          remove(prevChild.el);
          continue;
        }

        let newIndex;
        // 如果旧节点有key，那么去前面的映射表中查找
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        }
        // 如果旧节点没有key，则遍历新节点寻找与这个旧节点对应的新节点
        else {
          for (let j = s2; j <= e2; j++) {
            if (isSameNode(nextChildren[j], prevChild)) {
              newIndex = j;
              break;
            }
          }
        }

        // 如果旧节点有对应的新节点直接更新，否则删除
        if (newIndex == null) {
          remove(prevChild.el);
        } else {
          if (newIndex >= k) {
            k = newIndex;
          } else {
            needMove = true;
          }
          newIndexToOldIndexMap[newIndex - s2] = i;
          patch(prevChild, nextChildren[newIndex], container, parent, null);
          patchedCount++;
        }
      }

      // 使用getSequence()获取最长递增子序列
      const maxIncreasingNewIndex = needMove
        ? getSequence(newIndexToOldIndexMap)
        : [];
      // 为了保持使用insert()插入的稳定性，我们使用倒序，因为如果正序的话，插入节点所依赖的后面相邻的节点不一定不需要移动
      // j指向最长递增子序列的最后一个位置
      let j = maxIncreasingNewIndex.length - 1;
      for (let i = toBePatchedCount - 1; i >= 0; i--) {
        // 取出未处理的新节点的最后一个节点
        const newChildIndex = i + s1;
        const newChild = nextChildren[newChildIndex];
        // 判断是否锚点
        const anchor =
          newChildIndex + 1 < nextChildren.length
            ? nextChildren[newChildIndex + 1].el
            : null;
        // 之前创建的节点索引表，如果新节点索引对应的位置上是初始值-1，那么说明他没有对应的旧节点，所以需要创建
        if (newIndexToOldIndexMap[i] === -1) {
          patch(null, newChild, container, parent, anchor);
        }
        // 如果当前新节点的index在最长递增子序列中，说明这个节点是稳定的不需要移动，移动j指针指向前一个就行，否则插入节点
        if (needMove) {
          if (j < 0 || i !== maxIncreasingNewIndex[j]) {
            insert(newChild.el, container, anchor);
          } else {
            j--;
          }
        }
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

  function mountElement(vnode, container, parent, anchor) {
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
      mountChildren(children, el, parent, anchor);
    }
    // insert
    insert(el, container, anchor);
  }

  function mountChildren(children, container, parent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parent, anchor);
    });
  }

  function processComponent(n1, n2, container, parent) {
    if (!n1) {
      mountComponent(n2, container, parent);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    const instance = n1.component;
    n2.component = instance;
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(vnode, container, parent) {
    // 创建组件实例
    // 实例上会存储必要的属性
    // 在instance上挂载vnode、type
    const instance = createComponentInstance(vnode, parent);
    vnode.component = instance;

    // 初始化组件
    // 挂载setupState
    // 挂载组件代理对象proxy
    // 挂载render
    setupComponent(instance);
    // 取出组件代理对象proxy，绑定其为this执行render
    setupRenderEffect(instance, vnode, container);
  }

  function setupRenderEffect(instance, vnode, container) {
    instance.update = effect(() => {
      if (!instance.isMounted) {
        console.log("=== mount ===");
        const { proxy } = instance;
        // 执行完render函数之后，返回的是根节点的vnode对象
        const subTree = instance.render.call(proxy);
        instance.subTree = subTree;

        patch(null, subTree, container, instance, null);

        vnode.el = subTree.el;

        instance.isMounted = true;
      } else {
        console.log("=== update ===");
        const { proxy, next, vnode } = instance;

        if (next) {
          next.el = vnode.el;

          updateComponentPreRender(instance, next);
        }

        // 执行完render函数之后，返回的是根节点的vnode对象
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;

        patch(prevSubTree, subTree, container, instance, null);
      }
    });
  }

  function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
  }

  return {
    createApp: createAppApi(render),
  };
}

function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
