/*
 * @Description: app
 * @Author: Sunly
 * @Date: 2022-12-11 15:35:53
 */
import { h, getCurrentInstance } from "../../lib/i-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  setup() {
    console.log("app", getCurrentInstance());
    return {
      name: "App",
    };
  },
  render() {
    return h("div", { id: "root" }, [h("div", {}, "app"), h(Foo)]);
  },
};
