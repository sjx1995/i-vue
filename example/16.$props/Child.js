/*
 * @Description: 子组件
 * @Author: Sunly
 * @Date: 2022-12-22 14:06:44
 */
import { h } from "../../lib/i-vue.esm.js";

export const Child = {
  setup() {},
  render() {
    return h("div", {}, this.$props.msg);
  },
};
