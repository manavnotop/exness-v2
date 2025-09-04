import express, { Request, Response } from 'express';
import router from './router';
import cookieParser from 'cookie-parser';
import "dotenv/config"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", router);

app.listen(process.env.HTTP_PORT, () => {
  console.log('backend started at port 3000');
});