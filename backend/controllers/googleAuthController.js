const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helper to sign your app JWT (matches your existing login controller)
function signAppToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      roles: user.roles,
      activeRole: user.activeRole || user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
}

/**
 * Parse college email of forms:
 * - Students:  XXYYYZZZ@smvdu.ac.in
 *    where XX = last two digits of admission year -> batch
 *          YYY = course code (optional extraction)
 *          ZZZ = roll number
 * - Mentors/Teachers: surname.name@smvdu.ac.in or name@smvdu.ac.in etc.
 *
 * Returns:
 *  { allowed: boolean, reason?: string, role: 'student'|'mentor', batch?: '20XX', course?: 'YYY', meta: {...} }
 */
function parseCollegeEmail(email) {
  if (!email || typeof email !== 'string') {
    return { allowed: false, reason: 'Invalid email' };
  }
  const lower = email.toLowerCase().trim();

  // Only allow college domain
  const domain = '@smvdu.ac.in';
  if (!lower.endsWith(domain)) {
    return { allowed: false, reason: 'Only smvdu.ac.in emails allowed' };
  }

  const local = lower.slice(0, -domain.length); // part before @

  // Student pattern: XXYYYZZZ (we expect digits and letters; use regex)
  // Example: 22bcs090 or 22bcs90 or 22bcs900
  // We'll capture first two digits as year, then letters (course), then digits (roll)
  const studentRegex = /^(\d{2})([a-z]{2,5})(\d{2,4})$/; // e.g., 22bcs90
  const match = local.match(studentRegex);
  if (match) {
    const yy = match[1]; // '22'
    const course = match[2]; // 'bcs'
    // derive full batch year e.g., '20' + yy -> '2022' OR keep as '22' depending on your stored format
    const batch = '20' + yy;
    return {
      allowed: true,
      role: 'student',
      batch,
      course,
      meta: { local, matchedStudent: true }
    };
  }

  // Mentor heuristic: if local contains a dot or alphabetic name pattern, treat as mentor
  // e.g., smith.john or john.smith or john
  const mentorRegex = /^[a-z]+(\.[a-z]+)*$/;
  if (mentorRegex.test(local)) {
    return {
      allowed: true,
      role: 'mentor',
      meta: { local, matchedMentor: true }
    };
  }

  // If not matching known patterns, disallow by default
  return { allowed: false, reason: 'Email format not recognized for students or mentors' };
}

exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    // Verify id token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(400).json({ success: false, message: 'Google account not verified' });
    }

    const email = (payload.email || '').toLowerCase();

    // Enforce college domain and parse role/batch
    const parsed = parseCollegeEmail(email);
    if (!parsed.allowed) {
      return res.status(403).json({ success: false, message: parsed.reason || 'Email not allowed' });
    }

    // Find existing user by email
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      // If parsed.role === 'student' we must provide batch because schema requires it
      let roleToCreate = parsed.role;
      const batchToSet = parsed.batch;
      const courseToSet = parsed.course;

      // If student but batch missing, decline or fallback to mentor creation
      if (roleToCreate === 'student' && !batchToSet) {
        // Option A: Reject and ask user to sign up via register flow / admin link
        // return res.status(400).json({ success: false, message: 'Could not determine student batch from email. Please register with batch.' });

        // Option B (safer): create as mentor fallback to avoid validation error.
        // We choose Option A or B based on your policy. Here we choose Option A by default.
        return res.status(400).json({
          success: false,
          message: 'Student email detected but batch could not be parsed. Please register via standard signup or contact admin.'
        });
      }

      // create a random password because the schema requires one; OAuth users won't use it
      const randomPassword = Math.random().toString(36).slice(-12);

      const createPayload = {
        name: payload.name || '',
        email,
        password: randomPassword,
        role: roleToCreate,
        roles: [roleToCreate],
        activeRole: roleToCreate,
        profileImage: payload.picture,
        oauthProvider: 'google',
        oauthId: payload.sub
      };

      if (roleToCreate === 'student') {
        createPayload.batch = batchToSet;
      }
      if (courseToSet) {
        createPayload.department = courseToSet.toUpperCase(); // or store raw course
      }

      user = await User.create(createPayload);
    } else {
      // Existing user found - ensure role/domain consistency
      // If existing user is student but parsed role is mentor (or vice versa) we won't flip roles automatically.
      // Optionally update name/profile image
      let updated = false;
      if (!user.roles || user.roles.length === 0) {
        user.roles = [user.role];
        updated = true;
      }
      if (!user.activeRole) {
        user.activeRole = user.role;
        updated = true;
      }
      if (!user.profileImage && payload.picture) {
        user.profileImage = payload.picture;
        updated = true;
      }
      if (!user.name && payload.name) {
        user.name = payload.name;
        updated = true;
      }
      if (updated) await user.save();
    }

    // Sign your app JWT
    const token = signAppToken(user);

    // Return token and user (similar shape to your login endpoint)
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roles: user.roles,
        activeRole: user.activeRole || user.role,
        batch: user.batch,
        department: user.department,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ success: false, message: 'Google authentication failed', error: err.message });
  }
};