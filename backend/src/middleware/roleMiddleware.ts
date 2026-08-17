export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const userRole = req.user.role || 'HR';
    const isAllowed = userRole === 'ADMIN' || roles.includes(userRole);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Role (${userRole}) is not allowed to access this resource`,
      });
    }

    next();
  };
};

export default checkRole;
