import crypto from 'crypto';
import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

export const secureTokenService = {
  /**
   * Create a Cryptographic Single-Use / Validated Token for Candidate Actions
   * tokenType: 'INTERVIEW' | 'OFFER' | 'ONBOARDING' | 'DOCUMENT_UPLOAD'
   */
  createSecureToken: async ({
    candidateId,
    applicationId,
    tokenType,
    data = {},
    expiresInHours = 168, // Default 7 days
  }: {
    candidateId: string;
    applicationId?: string;
    tokenType: string;
    data?: any;
    expiresInHours?: number;
  }) => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const tokenRecord = await prisma.candidateSecureToken.create({
      data: {
        candidateId,
        applicationId,
        token: rawToken,
        tokenType,
        data,
        expiresAt,
      },
    });

    return tokenRecord.token;
  },

  /**
   * Verify token without consuming it (read-only preview)
   */
  verifyToken: async (token: string, expectedType?: string) => {
    if (!token || typeof token !== 'string') {
      return { valid: false, message: 'Missing token' };
    }

    const record = await prisma.candidateSecureToken.findUnique({
      where: { token },
      include: {
        candidate: true,
        application: {
          include: {
            job: true,
            offer: true,
            interviews: {
              include: { hr: true },
              orderBy: { roundNumber: 'asc' },
            },
            onboarding: {
              include: { documents: true },
            },
          },
        },
      },
    });

    if (!record) {
      return { valid: false, message: 'Invalid or expired secure token.' };
    }

    if (record.revokedAt) {
      return { valid: false, message: 'This secure link has been revoked.' };
    }

    if (new Date() > new Date(record.expiresAt)) {
      return { valid: false, message: 'This secure link has expired. Please contact your HR manager.' };
    }

    if (expectedType && record.tokenType !== expectedType) {
      return { valid: false, message: `Token type mismatch (expected ${expectedType}).` };
    }

    return {
      valid: true,
      tokenRecord: record,
      candidate: record.candidate,
      application: record.application,
      data: record.data,
      isUsed: !!record.usedAt,
    };
  },

  /**
   * Consume / Mark Token as Used after Action Completion
   */
  consumeToken: async (token: string) => {
    try {
      await prisma.candidateSecureToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
    } catch (e) {
      logger.warn('Failed to mark token as used:', e);
    }
  },

  /**
   * Revoke existing tokens for candidate
   */
  revokeTokens: async (candidateId: string, tokenType?: string) => {
    await prisma.candidateSecureToken.updateMany({
      where: {
        candidateId,
        ...(tokenType && { tokenType }),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  },
};
