export type Middleware<T = any> = (
    context: T,
    next: () => Promise<void>
) => Promise<void>

function AsyncCompose<T>(
    middleware: Middleware<T>[]
): (context: T, next?: () => Promise<void>) => Promise<void> {
    // 检查 middleware 是否为数组
    if (!Array.isArray(middleware)) {
        throw new TypeError('Middleware stack must be an array!')
    }
    // 检查 middleware 中每一项是否为函数
    for (const fn of middleware) {
        if (typeof fn !== 'function') {
            throw new TypeError('Middleware must be composed of functions!')
        }
    }

    return function (context: T, next?: () => Promise<void>): Promise<void> {
        let index = -1 // 用于追踪中间件的执行顺序
        return dispatch(0)

        function dispatch(i: number): Promise<void> {
            if (i <= index) {
                return Promise.reject(new Error('next() called multiple times'))
            }
            index = i
            let fn = middleware[i]
            // 如果中间件链已经执行完毕，执行 `next`
            if (i === middleware.length) {
                fn = next || (() => Promise.resolve())
            }
            if (!fn) {
                return Promise.resolve() // 没有中间件可执行时返回 resolved Promise
            }
            try {
                // 调用中间件并传递上下文和下一个中间件
                return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
            } catch (err) {
                return Promise.reject(err) // 捕获同步错误
            }
        }
    }
}

export default AsyncCompose
