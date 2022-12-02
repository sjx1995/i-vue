/*
 * @Description: render
 * @Author: Sunly
 * @Date: 2022-12-01 02:56:33
 */
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
  // 挂载组件
  mountComponent(vnode, container);
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
