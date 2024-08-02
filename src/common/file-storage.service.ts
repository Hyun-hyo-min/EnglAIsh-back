import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileStorageService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async saveFile(buffer: Buffer, originalname: string): Promise<string> {
    const key = `audio/${uuid()}-${originalname}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'audio/mpeg',
    };

    const command = new PutObjectCommand(params);
    await this.s3Client.send(command);

    return this.getSignedS3Url(key);
  }

  async getSignedS3Url(key: string): Promise<string> {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };
    const command = new GetObjectCommand(params);

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}