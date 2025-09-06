import express, { Request, Response } from 'express';
import router from './router';
import cookieParser from 'cookie-parser';
import "dotenv/config"
import { enginePusher, tradePusher} from '@repo/redis/pubsub';
import { ResponseLoop } from './reponseloop';

const app = express();
(async () => {
  await tradePusher.connect()
  await enginePusher.connect();
})()

app.use(express.json());
app.use(cookieParser());

export const responseLoop = new ResponseLoop();

app.use("/api/v1", router);

app.listen(process.env.HTTP_PORT, () => {
  console.log('backend started at port 3000');
});