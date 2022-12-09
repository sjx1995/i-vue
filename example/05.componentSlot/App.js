/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-09 10:24:43
 */
import { h } from "../../lib/i-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  render() {
    const app = h("div", {}, "app");
    // const child = h(Child, {}, h("div", {}, "slot-content"));
    const child = h(Child, {}, [
      h("div", {}, "slot-content"),
      h("div", {}, "another-slot-content"),
    ]);

    return h("div", {}, [app, child]);
  },
  setup() {},
};
