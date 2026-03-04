const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isDoctorVerified: user.isDoctorVerified,
    };

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { requireAuth };