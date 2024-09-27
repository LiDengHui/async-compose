# AsyncCompose
AsyncCompose 是一个轻量的中间件组合器，适用于处理异步操作链。它允许你将多个中间件函数串联在一起，形成类似“洋葱模型”的执行顺序。此工具非常适合在 Koa、Express 等框架之外实现自定义中间件逻辑或其他需要异步控制流的场景。

## 特点
`支持异步控制流`：能够优雅地处理异步函数，使用 await 管理每个中间件的执行顺序。

`中间件机制`：遵循与 Koa 类似的“洋葱模型”，先执行前置逻辑，再执行后置逻辑。

`错误捕获`：内置错误处理机制，防止中间件中重复调用 next() 或抛出未捕获的异常。

## 安装
```bash
npm install @dhlx/async-compose
```

## 使用场景
AsyncCompose 适用于需要多个异步操作链式执行的场景。典型使用场景包括：

1. HTTP 请求处理中间件：在服务端接收到 HTTP 请求时，按顺序调用多个中间件，处理验证、权限检查、日志记录等操作。
2. 异步任务队列：串行化执行多个异步任务，如数据处理管道、文件处理、I/O 操作等。
3. API 请求流水线：在请求到达最终处理程序之前，通过一系列中间件对请求进行拦截、修改或验证。

### 示例 1：基本用法
```typescript
import { AsyncCompose, Middleware } from '@dhlx/async-compose';

// 定义中间件
const middleware1: Middleware<{ name: string }> = async (ctx, next) => {
    console.log('middleware1 before');
    await next(); // 调用下一个中间件
    console.log('middleware1 after');
};

const middleware2: Middleware<{ name: string }> = async (ctx, next) => {
    console.log('middleware2 before');
    await next();
    console.log('middleware2 after');
};

// 使用 AsyncCompose 串联中间件
const composed = AsyncCompose<{ name: string }>([middleware1, middleware2]);

// 执行
composed({ name: 'Alice' }).then(() => {
    console.log('All middlewares executed.');
});
```

输出：
```css
middleware1 before
middleware2 before
middleware2 after
middleware1 after
All middlewares executed.
```

### 示例 2：错误处理
如果某个中间件抛出错误，AsyncCompose 会自动捕获并处理错误。

```typescript

import { AsyncCompose, Middleware } from '@dhlx/async-compose';

// 中间件1 - 正常执行
const middleware1: Middleware<{ name: string }> = async (ctx, next) => {
    console.log('middleware1');
    await next();
};

// 中间件2 - 抛出错误
const middleware2: Middleware<{ name: string }> = async (ctx, next) => {
    throw new Error('Something went wrong');
};

// 使用 AsyncCompose 串联中间件
const composed = AsyncCompose<{ name: string }>([middleware1, middleware2]);

// 执行
composed({ name: 'Alice' }).catch((error) => {
    console.error('Caught an error:', error.message);
});
```
输出：
```go

middleware1
Caught an error: Something went wrong
```
### 示例 3：防止重复调用 next()
如果中间件不小心多次调用 next()，AsyncCompose 会抛出错误并终止执行。

```typescript
import { AsyncCompose, Middleware } from '@dhlx/async-compose';

// 中间件 - 多次调用 next()
const middleware: Middleware<{ name: string }> = async (ctx, next) => {
    await next();
    await next(); // 第二次调用 next() 会抛出错误
};

// 使用 AsyncCompose 串联中间件
const composed = AsyncCompose<{ name: string }>([middleware]);

// 执行
composed({ name: 'Alice' }).catch((error) => {
    console.error('Error:', error.message);
});
```
输出：
```perl
Error: next() called multiple times
```
## API
`AsyncCompose(middleware: Middleware[])`: ComposedFunction

参数

`middleware (Middleware[])`：一个由中间件函数组成的数组，每个中间件函数接受两个参数：context 和 next。

返回值

`ComposedFunction`：一个接受 context 和可选的 next 参数的函数。调用该函数会按顺序执行所有中间件。

Middleware 类型

```typescript
type Middleware<T> = (context: T, next: () => Promise<void>) => Promise<void>;
context：上下文对象，类型由使用者定义，可包含任意数据。
next：下一个中间件函数，通过 await next() 进入下一个中间件的执行。
```
# License
MIT License.