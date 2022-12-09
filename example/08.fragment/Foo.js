/*
 * @Description: Foo
 * @Author: Sunly
 * @Date: 2022-12-09 17:16:29
 */
import { h, renderSlot } from "../../lib/i-vue.esm.js";

export const Foo = {
  render() {
    return h(
      "div",
      {
        id: "root",
      },
      [
        renderSlot(this.$slot, "header", { msg: this.msg }),
        h("div", {}, "child content"),
        renderSlot(this.$slot, "footer", "blank"),
      ]
    );
  },
  setup() {
    return {
      msg: "hello world!",
    };
  },
};
