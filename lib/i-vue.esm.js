const Fragment = Symbol("fragment");
const Text = Symbol("Text");
// 如果是component，那么type值是一个对象，里面包含了setup()、render()等函数
// 如果是element，那么type值是一个标签名
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlags: getShapeFlag(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlags |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // vnode是个组件，而且第三个参数是对象，说明是个插槽
    if (vnode.shapeFlags & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlags |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

/*
 * @Description: h函数，对createVNode进行封装，方便调用
 * @Author: Sunly
 * @Date: 2022-12-04 19:40:29
 */
function h(type, props, children) {
    return createVNode(type, props, children);
}

/*
 * @Description: 渲染插槽
 * @Author: Sunly
 * @Date: 2022-12-09 14:37:46
 */
function renderSlot(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, [slot(props)]);
        }
    }
}

/*
 * @Description: 共享的方法
 * @Author: Sunly
 * @Date: 2022-11-27 00:36:18
 */
function isObject(value) {
    return value !== null && typeof value === "object";
}
const extend = Object.assign;
function hasChange(newVal, oldVal) {
    return !Object.is(newVal, oldVal);
}
function hasOwn(val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
}
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toHandlerKey = (str) => str ? "on" + capitalize(str) : "";
const EMPTY_OBJECT = {};

/*
 * @Description: 挂在到组件中的proxy对象的handler
 * @Author: Sunly
 * @Date: 2022-12-04 19:45:49
 */
const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slot: (i) => i.vnode.children,
};
const componentPublicInstanceHandlers = {
    get({ _: target }, key) {
        const { setupState, props } = target;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        if (publicPropertiesMap[key]) {
            return publicPropertiesMap[key](target);
        }
    },
};

/*
 * @Description: 处理props
 * @Author: Sunly
 * @Date: 2022-12-08 16:55:13
 */
function initProps(instance, props) {
    instance.props = props || {};
}

/*
 * @Description: effect
 * @Author: Sunly
 * @Date: 2022-10-15 21:06:59
 */
let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.isActive = true;
        this.scheduler = scheduler;
        this._fn = fn;
        this.deps = [];
    }
    run() {
        if (!this.isActive) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.isActive) {
            cleanup(this);
            this.isActive = false;
        }
    }
}
function cleanup(effect) {
    if (effect.onStop) {
        effect.onStop();
    }
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const bucket = new WeakMap();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = bucket.get(target);
    if (!depsMap) {
        depsMap = new Map();
        bucket.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    const depsMap = bucket.get(target);
    if (!depsMap)
        return;
    const dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    dep &&
        dep.forEach((effect) => {
            if (effect.scheduler) {
                effect.scheduler();
            }
            else {
                effect.run();
            }
        });
}
function effect(fn, opt = {}) {
    const reactiveEffect = new ReactiveEffect(fn, opt.scheduler);
    extend(reactiveEffect, opt);
    reactiveEffect.run();
    const runner = reactiveEffect.run.bind(reactiveEffect);
    runner.effect = reactiveEffect;
    return runner;
}

/*
 * @Description: proxy对象的handler
 * @Author: Sunly
 * @Date: 2022-11-25 10:02:51
 */
function createGetter(isReadonly = false, isShallow = false) {
    return function (target, key) {
        if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function (target, key, newValue) {
        Reflect.set(target, key, newValue);
        trigger(target, key);
        return true;
    };
}
const mutableHandlers = {
    get: createGetter(),
    set: createSetter(),
};
const readonlyHandlers = {
    get: createGetter(true),
    set(target) {
        console.warn(`${target}是 readonly 的，不能设置值`);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: createGetter(true, true),
});

/*
 * @Description: reactive
 * @Author: Sunly
 * @Date: 2022-11-25 02:22:38
 */
function createReactiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn(target `${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandler);
}
function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}

/*
 * @Description: 处理emit
 * @Author: Sunly
 * @Date: 2022-12-08 18:38:14
 */
function emit(instance, event, ...args) {
    const { props } = instance;
    const handler = props[toHandlerKey(camelize(event))];
    handler && handler(...args);
}

function initSlots(instance, children) {
    const { shapeFlags } = instance;
    if (shapeFlags & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
function normalizeObjectSlots(slots, children) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

/*
 * @Description: ref
 * @Author: Sunly
 * @Date: 2022-11-29 11:04:36
 */
class refImpl {
    constructor(refValue) {
        this._refValue = convert(refValue);
        this._dep = new Set();
        this._v__isRef = true;
    }
    get value() {
        if (isTracking()) {
            trackEffect(this._dep);
        }
        return this._refValue;
    }
    set value(value) {
        if (hasChange(value, this._rawValue)) {
            this._rawValue = value;
            this._refValue = convert(value);
            triggerEffect(this._dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(raw) {
    return new refImpl(raw);
}
function isRef(raw) {
    return !!raw._v__isRef;
}
function unRef(raw) {
    return isRef(raw) ? raw.value : raw;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        // 获取值的时候使用unRef，去掉value
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        // 设置值的时候，如果原来的值是ref而且新的值不是ref，直接修改.value
        // 否则，老值不是ref或者新值是ref，都直接使用setter
        set(target, key, newVal) {
            const oldVal = target[key];
            if (isRef(oldVal) && !isRef(newVal)) {
                oldVal.value = newVal;
                return true;
            }
            else {
                Reflect.set(target, key, newVal);
            }
            return true;
        },
    });
}

/*
 * @Description: component
 * @Author: Sunly
 * @Date: 2022-12-01 03:10:16
 */
function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        parent,
        provides: parent ? parent.provides : {},
        slots: {},
        isMounted: false,
        subTree: {},
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // 初始化
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    instance.proxy = new Proxy({ _: instance }, componentPublicInstanceHandlers);
    setCurrentInstance(instance);
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        handleSetupResult(instance, setupResult);
    }
    setCurrentInstance(null);
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

/*
 * @Description: provide / inject
 * @Author: Sunly
 * @Date: 2022-12-16 16:11:22
 */
function provide(key, val) {
    const instance = getCurrentInstance();
    if (instance) {
        let { provides } = instance;
        const parentProvides = instance.parent.provides;
        if (provides === parentProvides) {
            provides = Object.create(parentProvides);
            instance.provides = provides;
        }
        provides[key] = val;
    }
}
function inject(key, defaultVal) {
    const instance = getCurrentInstance();
    if (instance) {
        const { provides } = instance.parent;
        if (key in provides) {
            return provides[key];
        }
        else {
            if (defaultVal != null) {
                if (typeof defaultVal === "function") {
                    return defaultVal();
                }
                return defaultVal;
            }
        }
    }
}

/*
 * @Description:
 * @Author: Sunly
 * @Date: 2022-12-01 02:35:15
 */
function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 转换成虚拟节点，之后所有的操作都基于虚拟节点
                const vnode = createVNode(rootComponent);
                if (typeof rootContainer === "string") {
                    rootContainer = document.querySelector(rootContainer);
                }
                render(vnode, rootContainer);
            },
        };
    };
}

/*
 * @Description: render
 * @Author: Sunly
 * @Date: 2022-12-01 02:56:33
 */
function createRenderer(options) {
    function render(vnode, container) {
        // 方便递归调用
        patch(null, vnode, container, null);
    }
    const { createElement, patchProp, insert, remove, setElementText } = options;
    function patch(n1, n2, container, parent) {
        const { type, shapeFlags } = n2;
        switch (type) {
            case Fragment:
                mountChildren(n2.children, container, parent);
                break;
            case Text:
                processTextNode(n1, n2, container);
                break;
            default:
                if (shapeFlags & 1 /* ShapeFlags.ELEMENT */) {
                    // 处理元素
                    processElement(n1, n2, container, parent);
                }
                else if (shapeFlags & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parent);
                }
                break;
        }
    }
    function processTextNode(n1, n2, container) {
        const textNode = document.createTextNode(n2.children);
        n2.el = textNode;
        container.append(textNode);
    }
    function processElement(n1, n2, container, parent) {
        if (!n1) {
            mountElement(n2, container, parent);
        }
        else {
            patchElement(n1, n2, container, parent);
        }
    }
    function patchElement(n1, n2, container, parent) {
        console.log("patch element");
        console.log(n1);
        console.log(n2);
        const oldProps = n1.props || EMPTY_OBJECT;
        const newProps = n2.props || EMPTY_OBJECT;
        const el = n1.el;
        n2.el = el;
        patchChildren(n1, n2, el, parent);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parent) {
        const { shapeFlags: prevShapeFlag } = n1;
        const { children: prevChildren } = n1;
        const { shapeFlags: nextShapeFlag } = n2;
        const { children: nextChildren } = n2;
        if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            if (nextShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // 数组节点 -> 文字节点
                unmountChildren(prevChildren);
                setElementText(container, nextChildren);
            }
        }
        else {
            // 文字节点 -> 文字节点
            if (nextShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                setElementText(container, nextChildren);
            }
            else {
                // 文字节点 -> 数组节点
                setElementText(container, "");
                mountChildren(nextChildren, container, parent);
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            remove(child);
        }
    }
    function patchProps(el, oldProps, newProps) {
        for (const key in newProps) {
            const oldVal = oldProps[key];
            const newVal = newProps[key];
            if (newVal !== oldVal) {
                patchProp(el, key, oldVal, newVal);
            }
        }
        if (oldProps !== EMPTY_OBJECT) {
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    patchProp(el, key, oldProps[key], null);
                }
            }
        }
    }
    function mountElement(vnode, container, parent) {
        const { type, props, children, shapeFlags } = vnode;
        // cerate element
        const el = createElement(type);
        vnode.el = el;
        // set attribute
        if (props) {
            for (const key in props) {
                const value = props[key];
                // set prop
                patchProp(el, key, null, value);
            }
        }
        if (shapeFlags & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlags & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(children, el, parent);
        }
        // insert
        insert(el, container);
    }
    function mountChildren(children, container, parent) {
        children.forEach((v) => {
            patch(null, v, container, parent);
        });
    }
    function processComponent(n1, n2, container, parent) {
        mountComponent(n2, container, parent);
    }
    function mountComponent(vnode, container, parent) {
        // 创建组件实例
        // 实例上会存储必要的属性
        // 在instance上挂载vnode、type
        const instance = createComponentInstance(vnode, parent);
        // 初始化组件
        // 挂载setupState
        // 挂载组件代理对象proxy
        // 挂载render
        setupComponent(instance);
        // 取出组件代理对象proxy，绑定其为this执行render
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                // 执行完render函数之后，返回的是根节点的vnode对象
                const subTree = instance.render.call(proxy);
                instance.subTree = subTree;
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                // 执行完render函数之后，返回的是根节点的vnode对象
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render),
    };
}

/*
 * @Description: DOM平台渲染器
 * @Author: Sunly
 * @Date: 2022-12-16 18:13:19
 */
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, oldVal, newVal) {
    const isOn = (str) => /^on[A-Z]/.test(str);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, newVal);
    }
    else {
        if (newVal == null) {
            el.removeAttribute(key);
        }
        else {
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
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextNode, getCurrentInstance, h, inject, provide, ref, renderSlot };
