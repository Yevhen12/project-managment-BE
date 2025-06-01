// src/common/aws/aws-s3.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  async uploadFile(file: any): Promise<string> {
    const key = `attachments/${uuidv4()}-${file.originalname}`;
    console.log({ file });
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: Buffer.from(file.buffer.data),
        ContentType: file.mimetype,
      });

      await this.s3.send(command);

      return `https://${this.bucketName}.s3.${this.configService.get<string>(
        'AWS_REGION',
      )}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new InternalServerErrorException('S3 Upload failed', error.message);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new InternalServerErrorException('S3 delete failed');
    }
  }
}
