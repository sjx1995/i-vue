/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-22 14:56:11
 */
import { h, ref } from "../../lib/i-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  setup() {
    const count1 = ref(0);
    const count2 = ref(0);

    const handleAdd1 = () => {
      count1.value++;
    };
    const handleAdd2 = () => {
      count2.value++;
    };

    return {
      count1,
      count2,
      handleAdd1,
      handleAdd2,
    };
  },
  render() {
    console.log("render app");
    return h("div", {}, [
      h("h4", {}, "The example of update component"),
      h("button", { onClick: this.handleAdd1 }, "add count1"),
      h(Child, { count: this.count1 }),
      h("button", { onClick: this.handleAdd2 }, "add count2"),
      h("div", {}, "count2:" + this.count2),
    ]);
  },
};
