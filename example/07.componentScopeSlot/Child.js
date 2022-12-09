/*
 * @Description: Child
 * @Author: Sunly
 * @Date: 2022-12-09 16:06:52
 */
import { h, renderSlot } from "../../lib/i-vue.esm.js";

export const Child = {
  render() {
    const msg = "The message is defined in child component";

    return h("div", {}, [
      renderSlot(this.$slot, "header", { msg }),
      h("div", {}, "child content"),
      renderSlot(this.$slot, "footer"),
    ]);
  },
  setup() {},
};
