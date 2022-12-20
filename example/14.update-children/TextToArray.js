/*
 * @Description: 文本节点更新成数组节点
 * @Author: Sunly
 * @Date: 2022-12-20 11:05:57
 */
import { h, ref } from "../../lib/i-vue.esm.js";

export const TextToArray = {
  setup() {
    const isChange = ref(true);
    window.isChange = isChange;

    return {
      isChange,
    };
  },

  render() {
    // 控制台输入windows.isChange.value = false，改变节点类型
    const prevText = h("div", {}, "text node");
    const nextArray = h("div", {}, [
      h("div", {}, "array a"),
      h("div", {}, "array b"),
      h("div", {}, "array c"),
    ]);
    return this.isChange ? prevText : nextArray;
  },
};
