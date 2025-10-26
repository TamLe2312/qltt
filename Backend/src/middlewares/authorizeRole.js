function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: Bạn không có quyền thực hiện hành động này.",
      });
    }

    next();
  };
}

module.exports = authorizeRole;
