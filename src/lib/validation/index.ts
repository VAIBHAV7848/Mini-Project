import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  role: z.enum(['CLIENT', 'FREELANCER']),
});

export const createProjectSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  budget: z.number().positive(),
  skillTags: z.array(z.string().min(1)).min(1),
});

export const submitProposalSchema = z.object({
  projectId: z.string().uuid(),
  bidAmount: z.number().positive(),
  coverLetter: z.string().min(20),
});

export const contractActionSchema = z.object({
  action: z.enum([
    'DEPOSIT',
    'START_WORK',
    'SUBMIT_DELIVERABLE',
    'APPROVE_MILESTONE',
    'RELEASE_ESCROW',
    'RAISE_DISPUTE',
  ]),
  contractId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  fileName: z.string().min(1).optional(),
  fileUrl: z.string().url().optional(),
  sha256Checksum: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, 'Must be valid 64-character SHA-256 hexadecimal checksum')
    .optional(),
  submissionNotes: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

export const fileDisputeSchema = z.object({
  milestoneId: z.string().uuid(),
  reason: z.string().min(15),
});

export const disputeRulingSchema = z.object({
  ruling: z.enum(['RELEASE_TO_FREELANCER', 'REFUND_TO_CLIENT']),
  rulingNotes: z.string().min(20),
});

export const createGigSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  category: z.string().min(2),
  tiers: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().positive(),
        deliveryDays: z.number().int().positive(),
        description: z.string(),
      })
    )
    .min(1),
});

export const placeOrderSchema = z.object({
  gigId: z.string().uuid(),
  tierName: z.string().min(1),
  amount: z.number().positive(),
});

export const addEvidenceSchema = z.object({
  fileUrl: z.string().url(),
  sha256Checksum: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, 'Must be valid 64-character SHA-256 hexadecimal checksum'),
  description: z.string().min(5),
});
