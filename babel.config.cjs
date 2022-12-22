/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-10-15 19:05:35
 */
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
    "@babel/preset-typescript",
  ],
};
