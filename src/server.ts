import fastify from "fastify"

const app = fastify()

app.get('/teste', () => {
 return 'Oie'
})

app.listen({
 port: 3333,
}).then(() => console.log('server is running'))