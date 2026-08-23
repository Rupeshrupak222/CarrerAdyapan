import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

export const auditService = {
  log: async ({
    userId,
    userRole,
    userName,
    action,
    entity,
    entityId,
    oldValue,
    newValue,
    ipAddress,
    metadata,
  }: {
    userId?: string;
    userRole?: string;
    userName?: string;
    action: string;
    entity: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    metadata?: any;
  }) => {
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          userRole: userRole || null,
          userName: userName || null,
          action,
          entity,
          entityId,
          oldValue: oldValue ? (typeof oldValue === 'object' ? oldValue : { value: oldValue }) : null,
          newValue: newValue ? (typeof newValue === 'object' ? newValue : { value: newValue }) : null,
          ipAddress: ipAddress || null,
          metadata: metadata ? (typeof metadata === 'object' ? metadata : { info: metadata }) : null,
        },
      });
    } catch (err: any) {
      logger.warn('Audit log write error:', err?.message || err);
    }
  },
};
