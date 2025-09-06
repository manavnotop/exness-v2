import { PriceStore } from "@repo/types/types";

let prices: PriceStore = {};

export async function handlePriceUpdate(update: PriceStore){
  console.log('update price function');

  Object.assign(prices, update);
  console.log("updated price store ", prices);
}