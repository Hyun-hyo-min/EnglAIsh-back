import { S3 } from 'aws-sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async uploadFile(file: Buffer, key: string): Promise<string> {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file,
    };

    await this.s3.upload(params).promise();

    return this.getSignedUrl(key);
  }

  private getSignedUrl(key: string): string {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 3600,
    };

    return this.s3.getSignedUrl('getObject', params);
  }
}