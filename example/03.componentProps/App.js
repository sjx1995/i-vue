/*
 * @Description: App.js
 * @Author: Sunly
 * @Date: 2022-12-08 16:24:03
 */
import { h } from "../../lib/i-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  render() {
    return h("div", {}, [
      h("h4", {}, "The example of props"),
      h(Child, { msg: "hello child" }),
    ]);
  },
  setup() {},
};
