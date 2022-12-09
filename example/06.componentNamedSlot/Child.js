/*
 * @Description: Child
 * @Author: Sunly
 * @Date: 2022-12-09 15:07:43
 */
import { h, renderSlot } from "../../lib/i-vue.esm.js";

export const Child = {
  render() {
    return h("div", {}, [
      renderSlot(this.$slot, "header"),
      h("div", {}, "child content"),
      renderSlot(this.$slot, "footer"),
    ]);
  },
  setup() {},
};
