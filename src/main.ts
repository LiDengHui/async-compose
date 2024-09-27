import AsyncCompose, { Middleware } from '../lib/main'

const middleware1: Middleware = async (ctx, next) => {
    console.log('Middleware 1-start:', ctx.name)
    await next()
    console.log('Middleware1-end')
}

const middleware2: Middleware = async (ctx, next) => {
    console.log('Middleware 2-start:', ctx.name)
    await next()
    console.log('middleware2-end')
}

const composed = AsyncCompose<{ name: string }>([middleware1, middleware2])

composed({ name: 'Alice' }).then(() => {
    console.log('All middlewares executed.')
})
