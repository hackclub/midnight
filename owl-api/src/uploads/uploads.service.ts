import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import { extname } from 'path';

export type UploadableFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@Injectable()
export class UploadsService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const region = this.configService.get<string>('R2_REGION') ?? 'auto';
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.get<string>('R2_BUCKET') ?? '';
    this.publicBaseUrl = this.normalizeBaseUrl(this.configService.get<string>('R2_PUBLIC_BASE_URL'));
    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucket) {
      throw new Error('R2 configuration is incomplete');
    }
    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadImage(file: UploadableFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are allowed');
    }
    const key = `${this.generateKey()}${this.resolveExtension(file)}`;
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch {
      throw new InternalServerErrorException('Failed to upload image');
    }
    const url = this.publicBaseUrl ? `${this.publicBaseUrl}/${key}` : key;
    return { url, key };
  }

  private generateKey() {
    return randomBytes(8).toString('hex');
  }

  private resolveExtension(file: UploadableFile) {
    const inferred = extname(file.originalname).toLowerCase();
    if (inferred) {
      return inferred;
    }
    if (file.mimetype === 'image/jpeg') {
      return '.jpg';
    }
    if (file.mimetype === 'image/png') {
      return '.png';
    }
    if (file.mimetype === 'image/webp') {
      return '.webp';
    }
    if (file.mimetype === 'image/gif') {
      return '.gif';
    }
    if (file.mimetype === 'image/avif') {
      return '.avif';
    }
    return '';
  }

  private normalizeBaseUrl(value?: string | null) {
    if (!value) {
      return '';
    }
    return value.endsWith('/') ? value.slice(0, -1) : value;
  }
}

