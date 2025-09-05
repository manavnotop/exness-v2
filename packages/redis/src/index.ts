import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import 'dotenv/config'

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL!
})

export default client;