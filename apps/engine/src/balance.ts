import { enginePusher } from "@repo/redis/pubsub";

// We'll import the users object from createuser.ts
import { users } from "./createuser";

export async function handleGetUserBalance(message: string) {
  try {
    const data = JSON.parse(message);
    const email = data.email;
    const id = data.id;

    if (!email) {
      console.log('Email missing in balance request');
      return;
    }

    // Check if user exists
    if (!users[email]) {
      console.log(`User ${email} not found`);
      // Send error response
      await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
        type: "user-balance-error",
        id: id,
        message: "User not found"
      });
      return;
    }

    // Get user balance
    const balance = users[email].balance;

    // Send balance back
    await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
      type: "user-balance-response",
      id: id,
      message: JSON.stringify({ balance: balance })
    });

    console.log(`Balance for ${email}: ${balance}`);
  } catch (error) {
    console.log("Error in handleGetUserBalance:", error);
  }
}

export async function handleGetAssetBalance(message: string) {
  try {
    const data = JSON.parse(message);
    const email = data.email;
    const id = data.id;

    if (!email) {
      console.log('Email missing in asset balance request');
      return;
    }

    // Check if user exists
    if (!users[email]) {
      console.log(`User ${email} not found`);
      // Send error response
      await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
        type: "asset-balance-error",
        id: id,
        message: "User not found"
      });
      return;
    }

    // Get user's open trades
    const openTrades = users[email].openTrades;

    // Send open trades back
    await enginePusher.xAdd('stream:engine:acknowledgement', "*", {
      type: "asset-balance-response",
      id: id,
      message: JSON.stringify({ openTrades: openTrades })
    });

    console.log(`Asset balance for ${email}:`, openTrades);
  } catch (error) {
    console.log("Error in handleGetAssetBalance:", error);
  }
}