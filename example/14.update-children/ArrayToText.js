/*
 * @Description: 数组节点更新成文本节点
 * @Author: Sunly
 * @Date: 2022-12-20 11:09:58
 */
import { h, ref } from "../../lib/i-vue.esm.js";

export const ArrayToText = {
  setup() {
    const isChange = ref(true);
    window.isChange = isChange;

    return {
      isChange,
    };
  },

  render() {
    // 控制台输入windows.isChange.value = false，改变节点类型
    const prevArray = h("div", {}, [
      h("div", {}, "array a"),
      h("div", {}, "array b"),
      h("div", {}, "array c"),
    ]);
    const nextText = h("div", {}, "text node");
    return this.isChange ? prevArray : nextText;
  },
};
