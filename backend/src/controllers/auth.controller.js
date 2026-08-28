const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { registerSchema, loginSchema } = require("../utils/validators");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  expiryToDate,
} = require("../utils/token");

// How refresh tokens are transported: httpOnly cookie, so client-side JS
// can never read it (mitigates XSS token theft). Access token goes in the
// JSON response body and lives in memory on the client.
const REFRESH_COOKIE_NAME = "refreshToken";

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, keep in sync with REFRESH_TOKEN_EXPIRY
    path: "/api/auth", // only sent to auth routes, not the whole API
  });
}

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: expiryToDate(process.env.REFRESH_TOKEN_EXPIRY || "7d"),
    },
  });

  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: expiryToDate(process.env.REFRESH_TOKEN_EXPIRY || "7d"),
    },
  });

  setRefreshCookie(res, refreshToken);
  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
  });
}

// Called by the frontend when an access token expires, to silently get a new one
async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return res.status(401).json({ error: "Refresh token no longer valid" });
  }

  // Rotate: revoke the old refresh token and issue a new one.
  // This limits the damage window if a refresh token is ever stolen.
  await prisma.refreshToken.update({
    where: { token },
    data: { revoked: true },
  });

  const newAccessToken = generateAccessToken(payload.sub);
  const newRefreshToken = generateRefreshToken(payload.sub);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.sub,
      expiresAt: expiryToDate(process.env.REFRESH_TOKEN_EXPIRY || "7d"),
    },
  });

  setRefreshCookie(res, newRefreshToken);
  res.json({ accessToken: newAccessToken });
}

async function logout(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  if (token) {
    await prisma.refreshToken
      .updateMany({ where: { token }, data: { revoked: true } })
      .catch(() => {}); // token might already be gone; not worth failing logout over
  }

  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.json({ message: "Logged out successfully" });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
}

module.exports = { register, login, refresh, logout, me };
