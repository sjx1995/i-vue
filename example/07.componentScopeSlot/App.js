/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-09 16:03:24
 */
import { h } from "../../lib/i-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  render() {
    const app = h("h4", {}, "The example of scope slot");
    const child = h(
      Child,
      {},
      {
        header: ({ msg }) => h("div", {}, msg),
        footer: () => h("div", {}, "footer slot"),
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
