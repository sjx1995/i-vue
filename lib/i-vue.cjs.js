'use strict';

const Fragment = Symbol("fragment");
const Text = Symbol("Text");
// 如果是component，那么type值是一个对象，里面包含了setup()、render()等函数
// 如果是element，那么type值是一个标签名
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        key: props && props.key,
        children,
        el: null,
        shapeFlags: getShapeFlag(type),
        component: null,
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
    $props: (i) => i.vnode.props,
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
        update: null,
        next: null,
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
 * @Description: 更新组件时，判断props有没有改变，没有改变就不用更新
 * @Author: Sunly
 * @Date: 2022-12-22 16:17:25
 */
function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

/*
 * @Description: 收集同步执行的effect，然后异步更新
 * @Author: Sunly
 * @Date: 2022-12-22 17:35:44
 */
const queue = [];
const p = Promise.resolve();
let isFlushPending = false;
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    let job = queue.shift();
    while (job) {
        job();
        job = queue.shift();
    }
}

/*
 * @Description: render
 * @Author: Sunly
 * @Date: 2022-12-01 02:56:33
 */
function createRenderer(options) {
    function render(vnode, container) {
        // 方便递归调用
        patch(null, vnode, container, null, null);
    }
    const { createElement, patchProp, insert, remove, setElementText } = options;
    function patch(n1, n2, container, parent, anchor) {
        const { type, shapeFlags } = n2;
        switch (type) {
            case Fragment:
                mountChildren(n2.children, container, parent, anchor);
                break;
            case Text:
                processTextNode(n1, n2, container);
                break;
            default:
                if (shapeFlags & 1 /* ShapeFlags.ELEMENT */) {
                    // 处理元素
                    processElement(n1, n2, container, parent, anchor);
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
    function processElement(n1, n2, container, parent, anchor) {
        if (!n1) {
            mountElement(n2, container, parent, anchor);
        }
        else {
            patchElement(n1, n2, container, parent, anchor);
        }
    }
    function patchElement(n1, n2, container, parent, anchor) {
        const oldProps = n1.props || EMPTY_OBJECT;
        const newProps = n2.props || EMPTY_OBJECT;
        const el = n1.el;
        n2.el = el;
        patchChildren(n1, n2, el, parent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parent, anchor) {
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
            else {
                // 数组节点 -> 数组节点
                patchKeyedChildren(prevChildren, nextChildren, container, parent);
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
                mountChildren(nextChildren, container, parent, anchor);
            }
        }
    }
    function isSameNode(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function patchKeyedChildren(prevChildren, nextChildren, container, parent) {
        let i = 0;
        let e1 = prevChildren.length - 1;
        let e2 = nextChildren.length - 1;
        // 左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = prevChildren[i];
            const n2 = nextChildren[i];
            if (isSameNode(n1, n2)) {
                patch(n1, n2, container, parent, null);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = prevChildren[e1];
            const n2 = nextChildren[e2];
            if (isSameNode(n1, n2)) {
                patch(n1, n2, container, parent, null);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 新的比旧的长，新增
        // i比旧节点的尾指针大，说明旧节点已经遍历完了
        // i不比新节点的尾指针大，说明新节点有没有对比的，i到e2的这些节点就是新增的
        if (e1 < i && e2 >= i) {
            const nextPos = e2 + 1;
            let anchor = null;
            if (nextPos < nextChildren.length) {
                anchor = nextChildren[nextPos].el;
            }
            while (i <= e2) {
                const el = nextChildren[i];
                patch(null, el, container, parent, anchor);
                i++;
            }
        }
        // 新的比旧的短，删除
        // i比新节点的尾指针大，说明新节点已经全部遍历完了
        // i没有比旧节点的尾指针大，说明旧节点存在没有对比的，i到e1的这些节点就是要删除的
        else if (i <= e1 && i > e2) {
            while (i <= e1) {
                remove(prevChildren[i].el);
                i++;
            }
        }
        // 对首尾进行预处理后，就锁定了中间的乱序部分
        else {
            let s1 = i;
            let s2 = i;
            const toBePatchedCount = e2 - s2 + 1;
            let patchedCount = 0;
            // 创建新节点{key:index}的映射
            const keyToNewIndexMap = new Map();
            for (let i = s2; i <= e2; i++) {
                const key = nextChildren[i].key;
                if (key != null) {
                    keyToNewIndexMap.set(key, i);
                }
            }
            // 创建一个数组：如果新节点复用了旧节点，那么在新节点对应的下标位置保存其在旧节点中的索引
            const newIndexToOldIndexMap = new Array(toBePatchedCount);
            newIndexToOldIndexMap.fill(-1);
            // 遍历旧节点时，每次找到其在新节点中的index，如果index始终递增，则说明保持了相对的顺序，不需要移动
            // k就是保存这个当前的最大索引，一旦新节点index小于k，则说明需要移动
            let k = 0;
            let needMove = false;
            for (let i = s1; i <= e1; i++) {
                const prevChild = prevChildren[i];
                // 当新节点已经全部patch，就没有必要比较旧节点，全部删除即可
                if (patchedCount >= toBePatchedCount) {
                    remove(prevChild.el);
                    continue;
                }
                let newIndex;
                // 如果旧节点有key，那么去前面的映射表中查找
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                // 如果旧节点没有key，则遍历新节点寻找与这个旧节点对应的新节点
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameNode(nextChildren[j], prevChild)) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                // 如果旧节点有对应的新节点直接更新，否则删除
                if (newIndex == null) {
                    remove(prevChild.el);
                }
                else {
                    if (newIndex >= k) {
                        k = newIndex;
                    }
                    else {
                        needMove = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i;
                    patch(prevChild, nextChildren[newIndex], container, parent, null);
                    patchedCount++;
                }
            }
            // 使用getSequence()获取最长递增子序列
            const maxIncreasingNewIndex = needMove
                ? getSequence(newIndexToOldIndexMap)
                : [];
            // 为了保持使用insert()插入的稳定性，我们使用倒序，因为如果正序的话，插入节点所依赖的后面相邻的节点不一定不需要移动
            // j指向最长递增子序列的最后一个位置
            let j = maxIncreasingNewIndex.length - 1;
            for (let i = toBePatchedCount - 1; i >= 0; i--) {
                // 取出未处理的新节点的最后一个节点
                const newChildIndex = i + s1;
                const newChild = nextChildren[newChildIndex];
                // 判断是否锚点
                const anchor = newChildIndex + 1 < nextChildren.length
                    ? nextChildren[newChildIndex + 1].el
                    : null;
                // 之前创建的节点索引表，如果新节点索引对应的位置上是初始值-1，那么说明他没有对应的旧节点，所以需要创建
                if (newIndexToOldIndexMap[i] === -1) {
                    patch(null, newChild, container, parent, anchor);
                }
                // 如果当前新节点的index在最长递增子序列中，说明这个节点是稳定的不需要移动，移动j指针指向前一个就行，否则插入节点
                if (needMove) {
                    if (j < 0 || i !== maxIncreasingNewIndex[j]) {
                        insert(newChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
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
    function mountElement(vnode, container, parent, anchor) {
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
            mountChildren(children, el, parent, anchor);
        }
        // insert
        insert(el, container, anchor);
    }
    function mountChildren(children, container, parent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, parent, anchor);
        });
    }
    function processComponent(n1, n2, container, parent) {
        if (!n1) {
            mountComponent(n2, container, parent);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = n1.component;
        n2.component = instance;
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function mountComponent(vnode, container, parent) {
        // 创建组件实例
        // 实例上会存储必要的属性
        // 在instance上挂载vnode、type
        const instance = createComponentInstance(vnode, parent);
        vnode.component = instance;
        // 初始化组件
        // 挂载setupState
        // 挂载组件代理对象proxy
        // 挂载render
        setupComponent(instance);
        // 取出组件代理对象proxy，绑定其为this执行render
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                // 执行完render函数之后，返回的是根节点的vnode对象
                const subTree = instance.render.call(proxy);
                instance.subTree = subTree;
                patch(null, subTree, container, instance, null);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy, next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                // 执行完render函数之后，返回的是根节点的vnode对象
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, null);
            }
        }, {
            scheduler() {
                queueJobs(instance.update);
            },
        });
    }
    function updateComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode;
        instance.next = null;
        instance.props = nextVNode.props;
    }
    return {
        createApp: createAppApi(render),
    };
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
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
function insert(el, container, anchor) {
    container.insertBefore(el, anchor);
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

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextNode = createTextNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.nextTick = nextTick;
exports.provide = provide;
exports.ref = ref;
exports.renderSlot = renderSlot;
