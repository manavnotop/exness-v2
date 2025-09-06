import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import 'dotenv/config'

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL!
})

export const tradePusher: RedisClientType = client.duplicate();

export const pricePusher: RedisClientType = client.duplicate();

export const enginePuller: RedisClientType = client.duplicate();

export const enginePusher: RedisClientType = client.duplicate();

export const httpPuller: RedisClientType = client.duplicate();

export const publisher: RedisClientType = client.duplicate();

export const subscriber: RedisClientType = client.duplicate();