import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { ResearchersRepository } from '../../modules/researchers/data/researchers.repository';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Every stored photo is normalized to a square JPEG so the read path can
// assume a single format and the BLOB stays small (lighter list queries).
const PHOTO_SIZE_PX = 512;
const JPEG_QUALITY = 80;

@Injectable()
export class UpdateResearcherPhotoUseCase {
  constructor(private readonly repo: ResearchersRepository) {}

  async execute(
    id: string,
    file: { buffer: Buffer; mimetype: string; size: number },
  ): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Researcher with id "${id}" not found`);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG and WebP images are allowed');
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('Image exceeds the 5 MB size limit');
    }

    const jpegBuffer = await this.toJpeg(file.buffer);
    await this.repo.updatePhoto(id, jpegBuffer);
  }

  /**
   * Re-encodes any supported image into a compressed, square JPEG.
   * `rotate()` honors the EXIF orientation before stripping metadata.
   */
  private async toJpeg(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .rotate()
        .resize(PHOTO_SIZE_PX, PHOTO_SIZE_PX, { fit: 'cover' })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();
    } catch {
      throw new BadRequestException('The uploaded file is not a valid image');
    }
  }
}
