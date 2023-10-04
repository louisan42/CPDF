import AWS from 'aws-sdk'
import fs from 'fs'

export async function downloadfromS3 (file_key: string) {
    try {
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        });


        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
            },
            region :'us-east-2',  
        });

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
        };

        const file_name = `/tmp/pdf-${Date.now()}.pdf`;
        const file = await s3.getObject(params).promise();
        fs.writeFileSync(file_name, file.Body as Buffer);
        return file_name;

    } catch (error) {
        console.error(error);
        return null;
    }
}