/*
 * @Description: 收集同步执行的effect，然后异步更新
 * @Author: Sunly
 * @Date: 2022-12-22 17:35:44
 */
const queue: Function[] = [];
const p = Promise.resolve();
let isFlushPending = false;

export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }

  queueFlush();
}

function queueFlush() {
  if (isFlushPending) return;
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
