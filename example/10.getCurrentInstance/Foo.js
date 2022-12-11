/*
 * @Description: Foo
 * @Author: Sunly
 * @Date: 2022-12-11 15:41:37
 */
import { h, getCurrentInstance } from "../../lib/i-vue.esm.js";

export const Foo = {
  setup() {
    console.log("foo", getCurrentInstance());
    return {
      name: "Foo",
    };
  },
  render() {
    return h("div", {}, "foo");
  },
};
