import { Pinecone } from "@pinecone-database/pinecone"
import { downloadfromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'

//let pinecone : Pinecone | null = null;

export const getPinecone = async () => {
    
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
            environment: process.env.PINECONE_ENVIRONMENT!,    
    });
    return await pinecone.listIndexes();

}

type PDFPage = {
    pageContent : string,
    metadata : {
        loc : {pageNumber : number}
    }
}

export async function loadS3IntoPinecone (file_key :string) {
    // obtain pdf -> download and read
    console.log('downloading from s3 to file system');
    const file_name = await downloadfromS3(file_key);
    if (!file_name) {
        throw new Error('Could not download file from S3');
    }
    const loader = new PDFLoader(file_name);
    const pages = await loader.load() as PDFPage[];

    // split and segment pdf  into smaller docs
    const document = await Promise.all(pages.map(prepareDocument));

    //vectorized and embed individual documents

    return pages;
}

export const truncateStringByBytes = (str: string, numBytes: number) => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    return new TextDecoder("utf-8").decode(encoded.slice(0, numBytes));
}

async function prepareDocument (page: PDFPage){
    let { pageContent, metadata } = page
    pageContent = pageContent.replace(/(\r\n|\n|\r)/gm, " ");
    //split the doc
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent, 
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000)
            }
        })
    ]);
    return docs;
}