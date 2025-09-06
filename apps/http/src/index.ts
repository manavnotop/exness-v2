import express, { Request, Response } from 'express';
import router from './router';
import cookieParser from 'cookie-parser';
import "dotenv/config"
import { tradePusher} from '@repo/redis/pubsub';

const app = express();
(async () => {
  await tradePusher.connect()
})()

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", router);

app.listen(process.env.HTTP_PORT, () => {
  console.log('backend started at port 3000');
});