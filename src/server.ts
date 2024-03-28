import fastify from "fastify"
import {z} from 'zod'
import { sql } from "./lib/postgres"
import postgres from "postgres"

const app = fastify()

app.get('/:code',async  (request, reply) => {
const linkSchema = z.object({
 code: z.string().min(3)
})
 const { code } = linkSchema.parse(request.params)

 const result = await sql /*sql*/`
 SELECT id, original_url
 FROM short_link
 WHERE short_link.code = ${code}`

if (result.length === 0 ) {

 return reply.status(404).send({message: 'Link not found.'})
}

const link = result[0]
 return reply.redirect(301, link.original_url)
})

app.get('/api/links', async () => {
 const result = await sql/*sql*/`
 SELECT * FROM short_link
 ORDER BY created_at DESC
 `

 return result
})

app.post('/api/links', async (request, reply) => {
 const schema = z.object({
  code: z.string().min(3),
  url: z.string().url()
 })
 const { code, url} = schema.parse(request.body) 

 try { const result = await sql/*sql*/`
 INSERT INTO short_link (code, original_url)
 VALUES(${code}, ${url})
 RETURNING id
 `

 const link = result[0]

 return reply.status(201).send({shortLinkId: link.id})
} catch(err) {
 if (err instanceof postgres.PostgresError) {
  if (err.code === '23505') {
  return reply.status(400).send({message: 'Duplicate code.'})
  }
 }

 return reply.status(500).send({message: 'Internal Server Error'})
}
})

app.listen({
 port: 3333,
}).then(() => console.log('server is running'))