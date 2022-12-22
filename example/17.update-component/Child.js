/*
 * @Description: 子组件
 * @Author: Sunly
 * @Date: 2022-12-22 15:01:44
 */
import { h } from "../../lib/i-vue.esm.js";

export const Child = {
  setup() {},
  render() {
    console.log("render child");
    return h("div", {}, "count1:" + this.$props.count);
  },
};
