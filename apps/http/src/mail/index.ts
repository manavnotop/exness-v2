import { Resend } from "resend";
import "dotenv/config"

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendSigninEmail = async (to: string, token: string) => {
  await resend.emails.send({
    from: "Exness <noreply@message.manv.me>",
    to: `${to}`,
    subject: "Click on the link to login to Exness",
    html: `<center>
        <h1>Please click here to login</h1>
        <a target="_blank" href="http://localhost:300//api/v1/signin/post?token=${token}">Click here</button>
      </center>`
  })
}