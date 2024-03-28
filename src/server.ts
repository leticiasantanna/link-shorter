import fastify from 'fastify';
import { z } from 'zod';
import { sql } from './lib/postgres';
import postgres from 'postgres';
import { redis } from './lib/redis';

const app = fastify();

app.get('/:code', async (request, reply) => {
  const linkSchema = z.object({
    code: z.string().min(3),
  });

  const { code } = linkSchema.parse(request.params);

  const result = await sql/* sql */ `

 SELECT id, original_url FROM short_link
 WHERE short_link.code = ${code}`;

  if (result.length === 0) {
    return await reply.status(404).send({ message: 'Link not found.' });
  }

  const link = result[0];
  return await reply.redirect(301, link.original_url );
});

app.get('/api/links', async () => {
  const result = await sql/* sql */ `

 SELECT * FROM short_link
 ORDER BY created_at DESC
 `;

  return result;
});

app.post('/api/links', async (request, reply) => {
  const schema = z.object({
    code: z.string().min(3),
    url: z.string().url(),
  });
  const { code, url } = schema.parse(request.body);

  try {
    const result = await sql/* sql */ `
 INSERT INTO short_link (code, original_url)
 VALUES(${code}, ${url})
 RETURNING id
 `;

    const link = result[0];

    return await reply.status(201).send({ shortLinkId: link.id });
  } catch (err) {
    if (err instanceof postgres.PostgresError) {
      if (err.code === '23505') {
        return await reply.status(400).send({ message: 'Duplicate code.' });
      }
    }

    return await reply.status(500).send({ message: 'Internal Server Error' });
  }
});

app.get('/api/metrics', async () => {
  const result = await redis.zRangeByScoreWithScores('metrics', 0, 50)

 const metrics = result.sort((a, b) => b.score - a.score).map((item) => {
  return {
    shortLinkId: Number(item.value),
    clicks: item.score
  }
 })
 
 return metrics
})

void app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('server is running');
  });
