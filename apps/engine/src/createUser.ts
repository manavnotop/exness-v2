import { UserStore } from "@repo/types/types";
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