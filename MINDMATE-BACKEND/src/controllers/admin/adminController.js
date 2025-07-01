const bcrypt = require('bcryptjs');
const asyncHandler = require('../../utils/asyncHandler');
const { generateToken } = require('../../config/jwt');

const Admin = require('../../models/Admin');
const CounselorPsychologist = require('../../models/CounselorPsychologist');
const Feedback = require('../../models/Feedback');
const Report = require('../../models/Report');
const Resource = require('../../models/Resource');
const Student = require('../../models/Student')
const Vent = require('../../models/VentWall');

const sendEmail = require('../../utils/autoEmail');
const sendSMS = (phone, message) => {
  console.log(`Sending SMS to ${phone}: ${message}`);
};

const regex = {
  aliasId: /^[a-zA-Z0-9_]{4,20}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{10,}$/,
  phone: /^\d{10}$/,
  email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
};

const AdminController = {

  // AUTH
  signupAdmin: asyncHandler(async (req, res) => {
    const { AliasId, password, role, phone, email } = req.body;

    if (!AliasId || !password || !role || !phone || !email) {
      return res.status(400).json({ message: 'All fields required' });
    };
    if (!regex.aliasId.test(AliasId)) {
      return res.status(400).json({ message: 'Alias ID must be 4–20 characters, alphanumeric or underscore only' });
    };
    if (!regex.password.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 10 characters long and contain at least one letter and one number' });
    };
    if (!regex.phone.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    };
    if (!regex.email.test(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    };

    if (!['admin', 'moderator'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const existingUser = await Admin.findOne({ AliasId });
    if (existingUser) {
      return res.status(409).json({ message: 'Alias ID already exists' });
    };
    const existingPhone = await Admin.findOne({ Phone: phone });
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number is already registered' });
    };
    const existingEmail = await Admin.findOne({ Email: email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already registered' });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      AliasId,
      PasswordHash: hashedPassword,
      Role: role
    });

    const token = generateToken({ _id: newAdmin._id, role });
    res.status(201).json({ token, user: newAdmin });
  }),

  loginAdmin: asyncHandler(async (req, res) => {
    const { AliasId, password } = req.body;

    if (!AliasId || !password) {
      return res.status(400).json({ message: 'Alias ID and password are required' });
    };

    const user = await Admin.findOne({ AliasId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let isMatch = false;

    if (user.isTempPassword) {
      if (!user.tempPasswordExpires || user.tempPasswordExpires < Date.now()) {
        return res.status(403).json({ message: 'Temporary password expired. Please reset again.' });
      }

      isMatch = await bcrypt.compare(password, user.tempPasswordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      user.isTempPassword = false;
      user.tempPasswordExpires = null;
      user.tempPasswordHash = null;
      await user.save();

      return res.status(200).json({
        token: generateToken({ _id: user._id, role: user.Role }),
        user,
        mustChangePassword: true,
        message: 'Logged in with temporary password. Please change your password immediately.',
      });
    } else {
      isMatch = await bcrypt.compare(password, user.PasswordHash);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid credentials' });

      const token = generateToken({ _id: user._id, role: user.Role });
      res.status(200).json({ token, user });
    };
  }),

  forgotAliasIdByPhone: asyncHandler(async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const user = await Admin.findOne({ Phone: phone });
    if (!user)
      return res.status(404).json({ message: 'No account found for this phone number' });

    sendSMS(phone, `Your Alias ID is: ${user.AliasId}`);
    if (user.Email) {
      await sendEmail({
        to: user.Email,
        subject: 'MindMate - Alias ID',
        html: `<p>Hello,</p><p>Your Alias ID is: <strong>${user.AliasId}</strong></p>`,
      });
    };

    res.status(200).json({ message: 'Alias ID sent to your registered phone and email' });
  }),

  forgotPasswordByPhone: asyncHandler(async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const user = await Admin.findOne({ Phone: phone });
    if (!user)
      return res.status(404).json({ message: 'No account found for this phone number' });

    const tempPassword = Math.random().toString(36).slice(-6);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    user.tempPasswordHash = hashedTempPassword;
    user.isTempPassword = true;
    user.tempPasswordExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    sendSMS(phone, `Your temporary password is: ${tempPassword}. It expires in 5 minutes.`);
    if (user.Email) {
      await sendEmail({
        to: user.Email,
        subject: 'MindMate - Temporary Password',
        html: `<p>Your temporary password is: <strong>${tempPassword}</strong></p>
                <p>This password will expire in 5 minutes and can be used only once.</p>
        <p>Please log in and reset your password immediately.</p>
                `,
      });
    };

    res.status(200).json({ message: 'Temporary password sent to your registered phone and email.' });
  }),

  setNewPassword: asyncHandler(async (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password required' });
    };

    if (!regex.password.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 10 characters long and contain at least one letter and one number',
      });
    };

    const user = await Admin.findById(userId);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isSame = await bcrypt.compare(newPassword, user.PasswordHash);
    if (isSame)
      return res.status(400).json({ message: 'New password must differ from old' });

    user.PasswordHash = await bcrypt.hash(newPassword, 10);
    user.tempPasswordHash = null;
    user.isTempPassword = false;
    user.tempPasswordExpires = null;

    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  }),

  // PROFILE
  getProfile: asyncHandler(async (req, res) => {
    const user = await Admin.findById(req.user._id).select('-PasswordHash -tempPasswordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const allowed = ['Phone', 'Email'];
    const updates = req.body;

    const isValid = Object.keys(updates).every(field => allowed.includes(field));
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid update fields' });
    };
    if (updates.Phone && !regex.phone.test(updates.Phone)) {
      return res.status(400).json({ message: 'Phone must be a valid phone number' });
    };
    if (updates.Email && !regex.email.test(updates.Email)) {
      return res.status(400).json({ message: 'Email format is invalid' });
    };

    const updated = await Admin.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-PasswordHash');
    res.status(200).json(updated);
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    };

    const user = await Admin.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);
    if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });

    if (!regex.password.test(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 10 characters long and include at least one letter and one number',
      });
    };

    const isSame = await bcrypt.compare(newPassword, user.PasswordHash);
    if (isSame) return res.status(400).json({ message: 'New password must differ from old' });

    user.PasswordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  }),

};

module.exports = AdminController;