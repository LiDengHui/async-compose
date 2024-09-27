import test from 'ava'
import AsyncCompose from './dist/index.js'

// 测试基本的中间件调用顺序
test('should call middlewares in order', async (t) => {
    const logs = []

    const middleware1 = async (ctx, next) => {
        logs.push('middleware1 start')
        await next()
        logs.push('middleware1 end')
    }

    const middleware2 = async (ctx, next) => {
        logs.push('middleware2 start')
        await next()
        logs.push('middleware2 end')
    }

    const composed = AsyncCompose([middleware1, middleware2])

    await composed({ name: 'Alice' })

    t.deepEqual(logs, [
        'middleware1 start',
        'middleware2 start',
        'middleware2 end',
        'middleware1 end',
    ])
})

// 测试中间件抛出错误的情况
test('should handle middleware errors', async (t) => {
    const errorMiddleware = async (ctx, next) => {
        throw new Error('Middleware Error')
    }

    const composed = AsyncCompose([errorMiddleware])

    const error = await t.throwsAsync(async () => {
        await composed({ name: 'Bob' })
    })

    t.is(error?.message, 'Middleware Error')
})

// 测试 next() 调用多次时抛出的错误
test('should throw error if next() is called multiple times', async (t) => {
    const middleware = async (ctx, next) => {
        await next()
        await next() // 再次调用 next 应该触发错误
    }

    const composed = AsyncCompose([middleware])

    const error = await t.throwsAsync(async () => {
        await composed({ name: 'Charlie' })
    })

    t.is(error?.message, 'next() called multiple times')
})

// 测试当没有中间件时，AsyncCompose 正常执行
test('should work with no middleware', async (t) => {
    const composed = AsyncCompose([])
    await t.notThrowsAsync(async () => {
        await composed({ name: 'Dave' })
    })
})
