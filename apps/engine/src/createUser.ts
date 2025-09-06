import { UserStore } from "@repo/types/types"

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

    console.log(users);
  }
  catch (error) {
    console.log(error);
  }
}