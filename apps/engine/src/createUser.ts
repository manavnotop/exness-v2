import { Trade, UserStore } from "@repo/types/types";
import { enginePusher } from "@repo/redis/pubsub";

let users: UserStore = {

}

function createUser(email: string) {
  return {
    email: email,
    balance: 5000,
    openTrades: []
  }
}

export async function handleUserAdd(message: string) {
  try {
    const data = JSON.parse(message);
    const email = data.email;
    const id = data.id;

    if (!email) {
      console.log('email missing');
      return;
    }

    if (!users[email]) {
      users[email] = createUser(email);
      console.log('user created');
    }
    else {
      console.log('user already exists');
    }

    await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
      type: "user-acknowledgement",
      id: id
    })
    console.log(users);
  }
  catch (error) {
    console.log(error);
  }
}

export async function handleOpenTrade(email: string, trade: Trade, id: string){
  let user = users[email];

  user?.openTrades.push(trade);
  console.log(user?.openTrades);
  await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
    type: "trade-open",
    id: id
  })
}

export async function handleCloseTrade(email: string, orderId: string, id: string){
  console.log(users[email]?.openTrades)
  const user = users[email];

  const tradeIndex = user?.openTrades.findIndex((t) => t.id === orderId);
  console.log("this is trade index ", tradeIndex);
  
  user?.openTrades.splice(tradeIndex!, 1);

  await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
    type: "trade-close",
    id: id
  })
  console.log(users[email]?.openTrades);
}