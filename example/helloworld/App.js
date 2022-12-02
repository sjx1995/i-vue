/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-01 02:19:14
 */
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
