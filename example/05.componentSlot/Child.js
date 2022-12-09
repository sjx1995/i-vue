/*
 * @Description: Child
 * @Author: Sunly
 * @Date: 2022-12-09 10:42:04
 */
import { h, renderSlot } from "../../lib/i-vue.esm.js";

export const Child = {
  render() {
    return h(
      "div",
      {
        id: "foo",
      },
      renderSlot(this.$slot)
    );
  },
  setup() {},
};
