import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClaimDocument = Claim & Document;

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Claim {
  @Prop({ required: true })
  patientName: string;

  @Prop({ required: true, index: true })
  patientEmail: string;

  @Prop({ required: true })
  claimAmount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ default: '' })
  documentUrl: string;

  @Prop({ default: '' })
  documentOriginalName: string;

  @Prop({ default: '' })
  documentData: string;

  @Prop({ default: '' })
  documentMimeType: string;

  @Prop({ type: String, enum: ClaimStatus, default: ClaimStatus.PENDING, index: true })
  status: ClaimStatus;

  @Prop({ type: Number, default: null })
  approvedAmount?: number;

  @Prop({ default: '' })
  insurerComments?: string;

  @Prop({ default: Date.now, index: true })
  submissionDate: Date;

  @Prop({ type: Date, default: null })
  reviewedAt?: Date;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
