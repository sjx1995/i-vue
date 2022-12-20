/*
 * @Description: DOM平台渲染器
 * @Author: Sunly
 * @Date: 2022-12-16 18:13:19
 */
import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, oldVal, newVal) {
  const isOn = (str: string) => /^on[A-Z]/.test(str);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, newVal);
  } else {
    if (newVal == null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, newVal);
    }
  }
}

function insert(el, container) {
  container.append(el);
}

function remove(children) {
  const parent = children.parentElement;
  if (parent) {
    parent.removeChild(children);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
