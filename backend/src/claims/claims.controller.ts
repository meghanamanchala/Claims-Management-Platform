import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Configure Multer to store uploaded file in memory buffer instead of disk
const multerStorage = memoryStorage();

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('document', {
      storage: multerStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        const isExtValid = Boolean(ext.match(/\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/i));
        const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase());

        if (!isExtValid || !isMimeValid) {
          return callback(
            new BadRequestException('Only image (JPG/PNG/WEBP) and document (PDF/DOC) files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() createClaimDto: CreateClaimDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      createClaimDto.documentData = file.buffer.toString('base64');
      createClaimDto.documentMimeType = file.mimetype;
      createClaimDto.documentOriginalName = file.originalname;
    }
    return this.claimsService.create(createClaimDto);
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('email') email?: string,
    @Query('minAmount') minAmount?: any,
    @Query('maxAmount') maxAmount?: any,
  ) {
    return this.claimsService.findAll({ status, search, email, minAmount, maxAmount });
  }

  @Get('stats/summary')
  async getStats() {
    return this.claimsService.getStats();
  }

  @Get(':id/document')
  async getDocument(@Param('id') id: string, @Res() res: any) {
    const claim = await this.claimsService.findOne(id);
    if (!claim || !claim.documentData) {
      throw new NotFoundException('Document not found for this claim');
    }
    const buffer = Buffer.from(claim.documentData, 'base64');
    res.setHeader('Content-Type', claim.documentMimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${claim.documentOriginalName || 'claim-document'}"`,
    );
    return res.send(buffer);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.claimsService.findOne(id);
  }

  @Patch(':id/review')
  async updateReview(
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
  ) {
    return this.claimsService.updateReview(id, updateClaimDto);
  }
}
