import express, { Request, Response } from 'express';
import router from './router';

const app = express();

app.use(express.json());

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log('backend started at port 3000');
});