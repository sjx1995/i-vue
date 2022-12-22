/*
 * @Description: 解析插值表达式
 * @Author: Sunly
 * @Date: 2022-12-22 19:04:00
 */
import { baseParse } from "../src/parse";
import { NodeTypes } from "../src/ast";

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{message}}");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });
});
