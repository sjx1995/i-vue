/*
 * @Description: vnode
 * @Author: Sunly
 * @Date: 2022-12-01 02:41:30
 */
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
  };
  return vnode;
}
