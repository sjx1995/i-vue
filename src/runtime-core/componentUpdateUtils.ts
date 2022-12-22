/*
 * @Description: 更新组件时，判断props有没有改变，没有改变就不用更新
 * @Author: Sunly
 * @Date: 2022-12-22 16:17:25
 */
export function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }

  return false;
}
