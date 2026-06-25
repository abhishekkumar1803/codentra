import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return !!(
      this.config.get('CLOUDINARY_CLOUD_NAME') &&
      this.config.get('CLOUDINARY_API_KEY') &&
      this.config.get('CLOUDINARY_API_SECRET')
    );
  }

  async uploadImage(
    buffer: Buffer,
    folder = 'avatars',
  ): Promise<string> {
    if (!this.isConfigured()) {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`;
    }

    const cloudName = this.config.getOrThrow('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.getOrThrow('CLOUDINARY_API_KEY');
    const apiSecret = this.config.getOrThrow('CLOUDINARY_API_SECRET');
    const timestamp = Math.floor(Date.now() / 1000);

    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const form = new FormData();
    form.append('file', new Blob([buffer]), 'avatar.jpg');
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form },
    );

    if (!res.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = (await res.json()) as { secure_url: string };
    return data.secure_url;
  }
}
