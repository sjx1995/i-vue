/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-09 14:56:13
 */
import { h } from "../../lib/i-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  render() {
    const app = h("h4", {}, "The example of named slot");
    const child = h(
      Child,
      {},
      {
        header: h("div", {}, "this is header slot"),
        footer: h("div", {}, "this is footer slot"),
      }
    );

    return h(
      "div",
      {
        id: "root",
      },
      [app, child]
    );
  },
  setup() {},
};
