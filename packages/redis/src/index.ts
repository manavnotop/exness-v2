import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import 'dotenv/config'

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL!
})

export const publisher: RedisClientType = client.duplicate()

export const subscriber: RedisClientType = client.duplicate();