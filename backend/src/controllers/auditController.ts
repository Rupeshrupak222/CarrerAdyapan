import prisma from '../config/db.js';
import { logger } from '../utils/logger.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { entity, action, userId, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (entity) where.entity = String(entity);
    if (action) where.action = String(action);
    if (userId) where.userId = String(userId);

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }).catch(() => 0),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, department: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }).catch(() => []),
    ]);

    return res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      logs,
    });
  } catch (err: any) {
    logger.error('Get Audit Logs Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs: ' + err.message });
  }
};
