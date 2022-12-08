/*
 * @Description: 子组件
 * @Author: Sunly
 * @Date: 2022-12-08 16:35:32
 */
import { h } from "../../lib/i-vue.esm.js";

export const Child = {
  render() {
    return h("div", {}, "from parent component: " + this.msg);
  },
  setup(props) {
    console.log(props);
    // props是只读的
    props.msg = "not changed";
    console.log(props);
  },
};
