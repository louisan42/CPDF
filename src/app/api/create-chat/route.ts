// PATH: /api/create-chat

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { loadS3IntoPinecone } from "@/lib/pinecone";

export async function POST(req: Request, res: Response) {
    const {userId} = auth();
    console.log("user: ", userId);

    if (!userId) {
        return NextResponse.redirect("/sign-in");
    }
    try {
        const body = await req.json();
        const {file_key, file_name} = body;
        const pages = await loadS3IntoPinecone(file_key);
        console.log(`file key: ${file_key}`, `file name: ${file_name}`);

        return NextResponse.json({ pages });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error"
        })
    }
}