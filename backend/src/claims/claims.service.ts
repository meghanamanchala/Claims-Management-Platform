import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Claim, ClaimDocument, ClaimStatus } from './schemas/claim.schema';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@Injectable()
export class ClaimsService implements OnModuleInit {
  private readonly logger = new Logger(ClaimsService.name);
  private defaultClaimsList = [
    {
      patientName: 'Patient User',
      patientEmail: 'patient@example.com',
      claimAmount: 1250,
      description: 'Emergency Room Visit & Medical Imaging',
      documentUrl: '',
      documentOriginalName: '',
      status: ClaimStatus.PENDING,
      approvedAmount: null,
      insurerComments: '',
      submissionDate: new Date(Date.now() - 3600 * 24 * 2 * 1000),
    },
    {
      patientName: 'John Doe',
      patientEmail: 'john.doe@example.com',
      claimAmount: 450.5,
      description: 'Routine Physical Examination & Blood Work',
      documentUrl: '',
      documentOriginalName: '',
      status: ClaimStatus.APPROVED,
      approvedAmount: 450.5,
      insurerComments: 'Approved in full per policy terms',
      submissionDate: new Date(Date.now() - 3600 * 24 * 5 * 1000),
    },
    {
      patientName: 'Patient User',
      patientEmail: 'patient@example.com',
      claimAmount: 3200,
      description: 'Orthopedic Surgery Consultation & Prescription',
      documentUrl: '',
      documentOriginalName: '',
      status: ClaimStatus.APPROVED,
      approvedAmount: 3000,
      insurerComments: 'Approved $3,000 after annual deductible',
      submissionDate: new Date(Date.now() - 3600 * 24 * 10 * 1000),
    },
  ];

  private inMemoryClaims: any[] = this.defaultClaimsList.map((c, i) => ({
    _id: `claim_sample_${i + 1}`,
    id: `claim_sample_${i + 1}`,
    ...c,
  }));

  constructor(
    @InjectModel(Claim.name) private claimModel: Model<ClaimDocument>,
  ) {}

  async onModuleInit() {
    this.seedClaimsWithRetry();
  }

  private seedClaimsWithRetry(attempts = 0) {
    if (this.isMongoConnected()) {
      this.seedClaims();
      return;
    }
    if (attempts < 20) {
      setTimeout(() => this.seedClaimsWithRetry(attempts + 1), 1000);
    }
  }

  async seedClaims() {
    if (!this.isMongoConnected()) return;
    try {
      const count = await this.claimModel.countDocuments();
      if (count === 0) {
        await this.claimModel.insertMany(this.defaultClaimsList);
        this.logger.log('Successfully seeded 3 default claims into MongoDB.');
      } else {
        this.logger.log(`MongoDB contains ${count} existing claims.`);
      }
    } catch (err) {
      this.logger.warn(`Claims seeding skipped: ${err.message}`);
    }
  }

  private isMongoConnected(): boolean {
    try {
      return this.claimModel && this.claimModel.db && this.claimModel.db.readyState === 1;
    } catch {
      return false;
    }
  }

  async create(createClaimDto: CreateClaimDto): Promise<any> {
    const mockId = 'claim_' + (Date.now() + Math.floor(Math.random() * 1000));
    const hasDoc = Boolean(createClaimDto.documentData);

    const newClaimData = {
      patientName: createClaimDto.patientName,
      patientEmail: createClaimDto.patientEmail,
      claimAmount: Number(createClaimDto.claimAmount),
      description: createClaimDto.description,
      documentOriginalName: createClaimDto.documentOriginalName || '',
      documentData: createClaimDto.documentData || '',
      documentMimeType: createClaimDto.documentMimeType || '',
      documentUrl: createClaimDto.documentUrl || '',
      status: ClaimStatus.PENDING,
      approvedAmount: null,
      insurerComments: '',
      submissionDate: new Date(),
    };

    if (this.isMongoConnected()) {
      try {
        const createdClaim = new this.claimModel(newClaimData);
        if (hasDoc && !createdClaim.documentUrl) {
          createdClaim.documentUrl = `/api/claims/${createdClaim._id}/document`;
        }
        const result = await createdClaim.save();
        this.logger.log(`Successfully saved claim to MongoDB with file data (ID: ${result._id})`);
        return result;
      } catch (err) {
        this.logger.warn(`MongoDB save failed, using memory fallback: ${err.message}`);
      }
    }

    const mockClaim = {
      _id: mockId,
      id: mockId,
      ...newClaimData,
      documentUrl: hasDoc ? `/api/claims/${mockId}/document` : createClaimDto.documentUrl || '',
    };
    this.inMemoryClaims.unshift(mockClaim);
    return mockClaim;
  }

  async findAll(query: {
    status?: string;
    search?: string;
    email?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<any[]> {
    let mongoClaims: any[] = [];
    if (this.isMongoConnected()) {
      try {
        const filter: any = {};
        if (query.status && query.status !== 'ALL') {
          filter.status = query.status;
        }
        if (query.email) {
          filter.patientEmail = query.email.toLowerCase();
        }
        const minVal =
          query.minAmount !== undefined && query.minAmount !== null && !isNaN(Number(query.minAmount))
            ? Number(query.minAmount)
            : null;
        const maxVal =
          query.maxAmount !== undefined && query.maxAmount !== null && !isNaN(Number(query.maxAmount))
            ? Number(query.maxAmount)
            : null;

        if (minVal !== null || maxVal !== null) {
          filter.claimAmount = {};
          if (minVal !== null) filter.claimAmount.$gte = minVal;
          if (maxVal !== null) filter.claimAmount.$lte = maxVal;
        }
        if (query.search) {
          const sanitizedSearch = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const searchRegex = new RegExp(sanitizedSearch, 'i');
          filter.$or = [
            { patientName: searchRegex },
            { patientEmail: searchRegex },
            { description: searchRegex },
          ];
        }
        mongoClaims = await this.claimModel.find(filter).sort({ submissionDate: -1 }).exec();
        this.logger.log(`Fetched ${mongoClaims.length} claims from MongoDB.`);
      } catch (err) {
        this.logger.warn(`MongoDB find failed, using memory fallback: ${err.message}`);
      }
    }

    const mongoIds = new Set(mongoClaims.map(c => (c._id ? c._id.toString() : c.id)));
    const extraMemoryClaims = this.inMemoryClaims.filter(
      c => !mongoIds.has(c._id ? c._id.toString() : c.id)
    );
    let filtered = [...mongoClaims, ...extraMemoryClaims].map(c => {
      const id = c._id ? c._id.toString() : c.id;
      const docUrl = c.documentUrl || (c.documentData ? `/api/claims/${id}/document` : '');
      return typeof c.toObject === 'function' ? { ...c.toObject(), documentUrl: docUrl } : { ...c, documentUrl: docUrl };
    });

    if (query.status && query.status !== 'ALL') {
      filtered = filtered.filter(c => c.status === query.status);
    }

    if (query.email) {
      filtered = filtered.filter(c => c.patientEmail?.toLowerCase() === query.email.toLowerCase());
    }

    if (query.minAmount !== undefined && !isNaN(Number(query.minAmount))) {
      filtered = filtered.filter(c => c.claimAmount >= Number(query.minAmount));
    }

    if (query.maxAmount !== undefined && !isNaN(Number(query.maxAmount))) {
      filtered = filtered.filter(c => c.claimAmount <= Number(query.maxAmount));
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.patientName?.toLowerCase().includes(q) ||
          c.patientEmail?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          (c._id && c._id.toString().toLowerCase().includes(q))
      );
    }

    return filtered.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }

  async findOne(id: string): Promise<any> {
    if (this.isMongoConnected()) {
      try {
        const claim = await this.claimModel.findById(id).exec();
        if (claim) return claim;
      } catch (err) {
        this.logger.warn(`MongoDB findOne failed: ${err.message}`);
      }
    }

    const claim = this.inMemoryClaims.find(c => c._id === id || c.id === id);
    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }
    return claim;
  }

  async updateReview(id: string, updateClaimDto: UpdateClaimDto): Promise<any> {
    const reviewedAt = new Date();
    const approvedAmount =
      updateClaimDto.status === ClaimStatus.APPROVED
        ? updateClaimDto.approvedAmount !== undefined
          ? Number(updateClaimDto.approvedAmount)
          : null
        : 0;

    if (this.isMongoConnected()) {
      try {
        const claim = await this.claimModel.findById(id);
        if (claim) {
          claim.status = updateClaimDto.status;
          claim.approvedAmount = approvedAmount !== null ? approvedAmount : claim.claimAmount;
          claim.insurerComments = updateClaimDto.insurerComments || '';
          claim.reviewedAt = reviewedAt;
          return await claim.save();
        }
      } catch (err) {
        this.logger.warn(`MongoDB updateReview failed: ${err.message}`);
      }
    }

    const index = this.inMemoryClaims.findIndex(c => c._id === id || c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    const existing = this.inMemoryClaims[index];
    const updated = {
      ...existing,
      status: updateClaimDto.status,
      approvedAmount: approvedAmount !== null ? approvedAmount : existing.claimAmount,
      insurerComments: updateClaimDto.insurerComments || '',
      reviewedAt: reviewedAt,
    };

    this.inMemoryClaims[index] = updated;
    return updated;
  }

  async getStats(): Promise<any> {
    const claims = await this.findAll({});
    const totalClaims = claims.length;
    const pendingCount = claims.filter(c => c.status === ClaimStatus.PENDING).length;
    const approvedCount = claims.filter(c => c.status === ClaimStatus.APPROVED).length;
    const rejectedCount = claims.filter(c => c.status === ClaimStatus.REJECTED).length;

    const totalClaimValue = claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
    const totalApprovedPayout = claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

    return {
      totalClaims,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalClaimValue,
      totalApprovedPayout,
    };
  }
}
