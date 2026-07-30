const SecurityLog = require('../models/SecurityLog');

// In-memory store for rate limiting & failed login tracking
const failedLoginMap = new Map();   // key: ip|username → { count, firstAttempt }
const blockedIPs = new Map();       // key: ip → blockedUntil timestamp
const requestRateMap = new Map();   // key: ip → { count, windowStart }

const FAILED_LOGIN_THRESHOLD = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RATE_WINDOW_MS = 60 * 1000;          // 1 minute window
const RATE_THRESHOLD = 60;                 // max 60 requests/min before flagging

/**
 * Get real IP from request
 */
function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Log a security event to DB
 */
async function logSecurityEvent({ userId, username, role, activityType, ipAddress, threatLevel, status, details }) {
  try {
    await SecurityLog.create({
      userId: userId || undefined,
      username: username || 'Unknown',
      role: role || 'unknown',
      activityType,
      ipAddress: ipAddress || 'N/A',
      threatLevel: threatLevel || 'LOW',
      status: status || 'ACTIVE',
      details: details || '',
    });
  } catch (err) {
    console.error('[IDS] Failed to log security event:', err.message);
  }
}

/**
 * Record a failed login attempt and return whether the IP/user should be blocked
 */
async function recordFailedLogin({ ip, username, userId, role }) {
  const key = `${ip}|${username}`;
  const now = Date.now();

  const entry = failedLoginMap.get(key) || { count: 0, firstAttempt: now };
  entry.count += 1;
  failedLoginMap.set(key, entry);

  await logSecurityEvent({
    userId,
    username,
    role,
    activityType: 'FAILED_LOGIN',
    ipAddress: ip,
    threatLevel: entry.count >= FAILED_LOGIN_THRESHOLD ? 'HIGH' : 'MEDIUM',
    status: 'ACTIVE',
    details: `Failed login attempt #${entry.count}`,
  });

  if (entry.count >= FAILED_LOGIN_THRESHOLD) {
    blockedIPs.set(ip, now + BLOCK_DURATION_MS);
    failedLoginMap.delete(key);

    await logSecurityEvent({
      userId,
      username,
      role,
      activityType: 'USER_BLOCKED',
      ipAddress: ip,
      threatLevel: 'CRITICAL',
      status: 'BLOCKED',
      details: `IP blocked after ${FAILED_LOGIN_THRESHOLD} failed login attempts.`,
    });

    return { blocked: true };
  }

  return { blocked: false, attemptsLeft: FAILED_LOGIN_THRESHOLD - entry.count };
}

/**
 * Clear failed login record on successful login
 */
function clearFailedLogins(ip, username) {
  const key = `${ip}|${username}`;
  failedLoginMap.delete(key);
}

/**
 * Check if an IP is currently blocked
 */
function isIPBlocked(ip) {
  const blockedUntil = blockedIPs.get(ip);
  if (!blockedUntil) return false;
  if (Date.now() > blockedUntil) {
    blockedIPs.delete(ip);
    return false;
  }
  return true;
}

/**
 * Log face authentication events
 */
async function logFaceEvent({ userId, username, role, verified, ipAddress }) {
  await logSecurityEvent({
    userId,
    username,
    role,
    activityType: verified ? 'FACE_VERIFIED' : 'FACE_MISMATCH',
    ipAddress,
    threatLevel: verified ? 'LOW' : 'HIGH',
    status: verified ? 'RESOLVED' : 'ACTIVE',
    details: verified ? 'Face verification passed.' : 'Face mismatch — intrusion alert triggered.',
  });
}

/**
 * Log unauthorized route access
 */
async function logUnauthorizedAccess({ userId, username, role, ipAddress, route }) {
  await logSecurityEvent({
    userId,
    username,
    role,
    activityType: 'UNAUTHORIZED_ACCESS',
    ipAddress,
    threatLevel: 'HIGH',
    status: 'ACTIVE',
    details: `Unauthorized access attempt to: ${route}`,
  });
}

/**
 * Rate-limiting IDS middleware — detects rapid/brute-force API requests
 */
const idsRateLimitMiddleware = async (req, res, next) => {
  const ip = getIP(req);

  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    return res.status(429).json({
      message: '⚠ Suspicious activity detected. You are temporarily blocked.',
      blocked: true,
    });
  }

  // Track request rate
  const now = Date.now();
  const rateEntry = requestRateMap.get(ip) || { count: 0, windowStart: now };

  if (now - rateEntry.windowStart > RATE_WINDOW_MS) {
    // Reset window
    rateEntry.count = 1;
    rateEntry.windowStart = now;
  } else {
    rateEntry.count += 1;
  }
  requestRateMap.set(ip, rateEntry);

  if (rateEntry.count === RATE_THRESHOLD) {
    // Log brute force detection (only once per window)
    await logSecurityEvent({
      activityType: 'BRUTE_FORCE_DETECTED',
      ipAddress: ip,
      threatLevel: 'CRITICAL',
      status: 'ACTIVE',
      details: `${RATE_THRESHOLD} requests in 1 minute from IP ${ip}`,
    });
  }

  next();
};

module.exports = {
  idsRateLimitMiddleware,
  recordFailedLogin,
  clearFailedLogins,
  isIPBlocked,
  logFaceEvent,
  logUnauthorizedAccess,
  logSecurityEvent,
  getIP,
};
