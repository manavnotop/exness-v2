import { Trade, UserStore } from "@repo/types/types";
import { enginePusher } from "@repo/redis/pubsub";

export let users: UserStore = {

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
  console.log(email);
  let user = users[email];
  console.log("users", users);
  console.log("user", user);

  if (!user) {
    console.log(`User ${email} not found`);
    return;
  }

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

  if (!user) {
    console.log(`User ${email} not found`);
    return;
  }

  const tradeIndex = user?.openTrades.findIndex((t) => t.id === orderId);
  console.log("this is trade index ", tradeIndex);
  
  if (tradeIndex !== undefined && tradeIndex !== -1) {
    user?.openTrades.splice(tradeIndex, 1);
  }

  await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
    type: "trade-close",
    id: id
  })
  console.log(users[email]?.openTrades);
}