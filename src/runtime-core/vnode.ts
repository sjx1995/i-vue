/*
 * @Description: vnode
 * @Author: Sunly
 * @Date: 2022-12-01 02:41:30
 */
// 如果是component，那么只有type有值，值是一个对象
// 如果是element，那么参数就是熟悉的h函数的参数
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
  };
  return vnode;
}
