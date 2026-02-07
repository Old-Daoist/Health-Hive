const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const requireDoctor = (req, res, next) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Doctors only" });
  }
  next();
};

const requireVerifiedDoctor = (req, res, next) => {
  if (!req.user.isDoctorVerified) {
    return res.status(403).json({ message: "Doctor not verified" });
  }
  next();
};

module.exports = {
  requireAuth,
  requireDoctor,
  requireVerifiedDoctor
};
