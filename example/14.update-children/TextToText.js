/*
 * @Description: 文本节点更新成文本节点
 * @Author: Sunly
 * @Date: 2022-12-20 10:51:18
 */
import { h, ref } from "../../lib/i-vue.esm.js";

export const TextToText = {
  setup() {
    const isChange = ref(true);
    window.isChange = isChange;

    return {
      isChange,
    };
  },

  render() {
    // 控制台输入windows.isChange.value = false，改变节点类型
    const prevText = h("div", {}, "content a");
    const nextText = h("div", {}, "content b");
    return this.isChange ? prevText : nextText;
  },
};
