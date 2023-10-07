// import { OpenAIApi, Configuration } from "openai-edge"

// const config = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// })

// const openai = new OpenAIApi(config);

// export async function getEmbeddings(text: string) {
//     try {
//         const response = await openai.createEmbedding({
//             model: 'text-embedding-ada-002',
//             input: text.replace(/(\r\n|\n|\r)/gm, " "),
//         });

//         const result = await response.json();
//         console.log("result: ", result);

//         return result.data[0].embeddings as number[];
//     } catch (error) {
//         console.log("Error calling openAI: ",error);
//         throw error;
//     }
// }

import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";

const model = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

export async function getEmbeddings(text: string) {
  /* Embed queries */
//   const res = await model.embedQuery(
//     "What would be a good company name for a company that makes colorful socks?"
//   );
//   console.log({ res });
  /* Embed documents */
//   const documentRes = await model.embedDocuments(["Hello world", "Bye bye"]);
//   console.log({ documentRes });

    try {
        const res = await model.embedDocuments([text]);

        
        //console.log("result: ", {res});

        return res[0] as number[];
        
    } catch (error) {
        console.log("Error embedding Document: ",error);
        throw error;
    }
}
