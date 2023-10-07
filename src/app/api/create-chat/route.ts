// PATH: /api/create-chat

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { db } from "@/lib/DB";
import { chats } from "@/lib/DB/schema";
import { getS3Url } from "@/lib/s3";

export async function POST(req: Request, res: Response) {
    const {userId} = auth();
    console.log("user: ", userId);

    if (!userId) {
        return NextResponse.redirect("/sign-in");
    }
    try {
        const body = await req.json();
        const {file_key, file_name} = body;
        console.log("body: ", body);
        await loadS3IntoPinecone(file_key);

         const chat_id = await db.insert(chats).values({
            fileKey: file_key,
            pdf_name: file_name,
            pdfUrl: getS3Url(file_key),
            userId: userId
        }).returning({
            insertedId: chats.id,
        })
        
        return NextResponse.json({
            chat_id: chat_id[0].insertedId,
        },{status: 200})
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error"
        })
    }
}