import dayjs from "dayjs";
import { type FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer, { getTestMessageUrl } from "nodemailer";
import { z } from "zod";
import { getEmailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";


export async function createTip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips", {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email()
            })
        }
    }, async (request) => {
       const {destination, starts_at, ends_at, owner_email, owner_name} = request.body

        if(dayjs(starts_at).isBefore(new Date())) {
         throw new Error("Invalid trip start date.")
        }

        if(dayjs(ends_at).isBefore(starts_at)) {
            throw new Error("Invalid trip end date.")
           }


       const trip = await prisma.trip.create({
            data: {
                destination, starts_at, ends_at
            }
        })

    const mail = await getEmailClient()

    const message = await mail.sendMail({
        from: {
            name: "Equipe plann.er",
            address: "oi@planner.er",
        }, 
        to: {
            name: owner_name,
            address: owner_email
        },
        subject: "Testando envio de e-mail",
        html: `<p>Testando envio de e-mail</p>`
    })
    console.log(nodemailer,getTestMessageUrl(message))

 return { tripId: trip.id}

    })
}