/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-01 02:19:14
 */
import { h } from "../../lib/i-vue.esm.js";

export const App = {
  render() {
    return h("div", `hello ${this.msg}`);
  },
  setup() {
    return {
      msg: "world",
    };
  },
};
