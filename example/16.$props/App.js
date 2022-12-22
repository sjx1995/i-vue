/*
 * @Description: 父组件
 * @Author: Sunly
 * @Date: 2022-12-22 14:05:36
 */
import { h } from "../../lib/i-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  setup() {
    const msg = "hello from parent component";

    return {
      msg,
    };
  },
  render() {
    return h(Child, { msg: this.msg });
  },
};
