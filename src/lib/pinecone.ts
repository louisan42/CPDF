import { Pinecone, Vector, utils as PineconeUtils, PineconeRecord, RecordMetadata } from "@pinecone-database/pinecone"
import { downloadfromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'
import { getEmbeddings } from "./embeddings";
import md5 from 'md5';
import { convertToAscii } from "./utils";
import * as itertools from "itertools";

let pinecone : Pinecone | null = null;

export const getPinecone = async () => {
    if (!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
            environment: process.env.PINECONE_ENVIRONMENT!,    
    });}

     if (process.env.NODE_ENV != 'production') {
        console.log('pinecone: ', pinecone.listIndexes())
    }; 
    
    return pinecone;

}

type PDFPage = {
    pageContent : string,
    metadata : {
        loc : {pageNumber : number}
    }
}

function* chunks<T>(iterator: Iterator<T>, batch_size = 10): Generator<T[]> {
    const it: Iterable<T> = { [Symbol.iterator]: () => iterator };
    let chunk = Array.from(itertools.islice(it, batch_size));
    while (chunk.length) {
        yield chunk as T[];
        chunk = Array.from(itertools.islice(it, batch_size));
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
    const documents = await Promise.all(pages.map(prepareDocument));

    //vectorized and embed individual documents

    const vectors = await Promise.all(documents.flat().map(embedDocument));

    // upload to pinecone
    const client = await getPinecone();
    const pineconeIndex = client.Index('chatpdf');

    console.log('inserting vectors into pinecone');
    const asciiKey = convertToAscii(file_key);
    const namespace = pineconeIndex.namespace(asciiKey);

    // PineconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace, 10);
    for (const chunk of chunks(vectors.values(), 10)) {

        console.log('inserting chunk into pinecone', chunk);
        await pineconeIndex.upsert(chunk as PineconeRecord<RecordMetadata>[]);

    }

    const stats = await client.index('chatpdf').describeIndexStats();
    console.log('stats: ', stats);

    return documents[0];
}

async function embedDocument(doc:Document) {
   try {
        const embeddings = await getEmbeddings(doc.pageContent);
        const hash = md5(doc.pageContent);

        return {
            id: hash,
            values: embeddings,
            metadata: {
                pageNumber: doc.metadata.pageNumber,
                text: doc.metadata.text
            }
        } as PineconeRecord;

   } catch (error) {
    console.log("Error embedding document", error);
    throw error;
   }
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