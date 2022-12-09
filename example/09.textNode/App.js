/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-09 18:00:04
 */
import { h, createTextNode } from "../../lib/i-vue.esm.js";

export const App = {
  render() {
    return h(
      "div",
      {
        id: "root",
      },
      [h("h4", {}, "The example of text node"), createTextNode("text node")]
    );
  },
  setup() {},
};
