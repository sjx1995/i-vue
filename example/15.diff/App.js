/*
 * @Description: App
 * @Author: Sunly
 * @Date: 2022-12-21 10:06:07
 */
import { h, ref } from "../../lib/i-vue.esm.js";

export const App = {
  setup() {
    const isChange = ref(true);
    window.isChange = isChange;

    return {
      isChange,
    };
  },
  render() {
    // 左侧对比
    // const prev = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "c" }, "c"),
    // ];
    // const next = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "d" }, "d"),
    //   h("div", { key: "e" }, "e"),
    // ];

    // 右侧对比
    // const prev = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "c" }, "c"),
    // ];
    // const next = [
    //   h("div", { key: "d" }, "d"),
    //   h("div", { key: "e" }, "e"),
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "c" }, "c"),
    // ];

    // 右侧新增
    // const prev = [h("div", { key: "a" }, "a"), h("div", { key: "b" }, "b")];
    // const next = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "c" }, "c"),
    // ];

    // 左侧新增
    // const prev = [h("div", { key: "a" }, "a"), h("div", { key: "b" }, "b")];
    // const next = [
    //   h("div", { key: "c" }, "c"),
    //   h("div", { key: "d" }, "d"),
    //   h("div", { key: "e" }, "e"),
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    // ];

    // 右侧删除
    // const prev = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "c" }, "c"),
    // ];
    // const next = [h("div", { key: "a" }, "a"), h("div", { key: "b" }, "b")];

    // 左侧删除
    // const prev = [
    //   h("div", { key: "c" }, "c"),
    //   h("div", { key: "d" }, "d"),
    //   h("div", { key: "e" }, "e"),
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    // ];
    // const next = [h("div", { key: "a" }, "a"), h("div", { key: "b" }, "b")];

    // 双端对比之后，对中间部分进行删除、更新、移动
    // const prev = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "e" }, "e"),
    //   h("div", { key: "c" }, "c"),
    //   h("div", { key: "d" }, "d"),
    //   h("div", { key: "k" }, "k"),
    //   h("div", { key: "f" }, "f"),
    //   h("div", { key: "g" }, "g"),
    // ];
    // const next = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "c", id: "new-c" }, "c"),
    //   h("div", { key: "e", id: "new-e" }, "e"),
    //   h("div", { key: "f" }, "f"),
    //   h("div", { key: "g" }, "g"),
    // ];

    // 移动，使用最长递增子序列算法
    // const prev = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "c" }, "c"),
    //   h("div", { key: "d" }, "d"),
    //   h("div", { key: "e" }, "e"),
    //   h("div", { key: "f" }, "f"),
    //   h("div", { key: "g" }, "g"),
    // ];
    // const next = [
    //   h("div", { key: "a" }, "a"),
    //   h("div", { key: "b" }, "b"),
    //   h("div", { key: "e" }, "e"),
    //   h("div", { key: "c" }, "c"),
    //   h("div", { key: "d" }, "d"),
    //   h("div", { key: "f" }, "f"),
    //   h("div", { key: "g" }, "g"),
    // ];

    // 创建、移动、删除
    const prev = [
      h("div", { key: "a" }, "a"),
      h("div", { key: "b" }, "b"),
      h("div", { key: "e" }, "e"),
      h("div", { key: "c" }, "c"),
      h("div", { key: "d" }, "d"),
      h("div", { key: "k" }, "k"),
      h("div", { key: "f" }, "f"),
      h("div", { key: "g" }, "g"),
    ];
    const next = [
      h("div", { key: "a" }, "a"),
      h("div", { key: "b" }, "b"),
      h("div", { key: "c", id: "new-c" }, "c"),
      h("div", { key: "e", id: "new-e" }, "e"),
      h("div", { key: "u" }, "u"),
      h("div", { key: "f" }, "f"),
      h("div", { key: "g" }, "g"),
    ];

    return this.isChange ? h("div", {}, prev) : h("div", {}, next);
  },
};
