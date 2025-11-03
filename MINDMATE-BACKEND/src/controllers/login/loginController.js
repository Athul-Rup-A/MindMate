const asyncHandler = require('../../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/Admin');
const CounselorPsychologist = require('../../models/CounselorPsychologist');
const Student = require('../../models/Student');
const generateTempPassword = require('../../utils/tempPassGen')
const { generateToken } = require('../../config/jwt');
const sendEmail = require('../../utils/autoEmail')

const loginController = {

  login: asyncHandler(async (req, res) => {
    const { Username, password } = req.body;
    if (!Username || !password) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    let user =
      (await Admin.findOne({ Username })) ||
      (await CounselorPsychologist.findOne({ Username })) ||
      (await Student.findOne({ Username }));

    if (!user) return res.status(404).json({ message: 'User not found' });

    const role = user.Role?.toLowerCase?.(); // using DB stored role

    if (user.Status === 'blocked') {
      return res.status(403).json({ message: 'Account is blocked. Contact admin.' });
    }

    if (user.Status === 'inactive') {
      return res.status(403).json({ message: 'Account is inactive. Please wait for admin approval.' });
    }

    if ((role === 'counselor' || role === 'psychologist') && user.ApprovedByAdmin === false) {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    let isMatch = false;

    // Temporary password
    if (user.isTempPassword) {
      if (!user.tempPasswordExpires || user.tempPasswordExpires < Date.now()) {
        return res.status(403).json({ message: 'Temporary password expired. Please reset again.' });
      }
      isMatch = await bcrypt.compare(password, user.tempPasswordHash);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      // Invalidate temp password
      user.isTempPassword = false;
      user.tempPasswordHash = null;
      user.tempPasswordExpires = null;
      await user.save();

      return res.status(200).json({
        token: generateToken({ _id: user._id, role }),
        user,
        mustChangePassword: true,
        message: 'Logged in with temporary password. Please change your password immediately.',
      });
    }

    // Permanent password
    isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ _id: user._id, role });
    res.status(200).json({ token, user });
  }),

  forgotUsernameByPhone: asyncHandler(async (req, res) => {
    const { phone, role } = req.body;
    if (!phone || !role) return res.status(400).json({ message: 'Phone and role are required' });

    let userModel;
    switch (role) {
      case 'admin': userModel = Admin; break;
      case 'counselor': case 'psychologist': userModel = CounselorPsychologist; break;
      case 'student': userModel = Student; break;
      default: return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await userModel.findOne({ Phone: phone });
    if (!user) return res.status(404).json({ message: 'No account found for this phone number' });

    if (user.Email) {
      await sendEmail({
        to: user.Email,
        subject: 'MindMate - Username',
        html: `<p>Hello,</p><p>Your Username is: <strong>${user.Username}</strong></p>`,
      });
    }

    res.status(200).json({ message: 'Username sent to your registered phone and email' });
  }),

  forgotPasswordByPhone: asyncHandler(async (req, res) => {
    const { phone, role } = req.body;
    if (!phone || !role) return res.status(400).json({ message: 'Phone and role are required' });

    let userModel;
    switch (role) {
      case 'admin': userModel = Admin; break;
      case 'counselor': case 'psychologist': userModel = CounselorPsychologist; break;
      case 'student': userModel = Student; break;
      default: return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await userModel.findOne({ Phone: phone });
    if (!user) return res.status(404).json({ message: 'No account found for this phone number' });

    const tempPassword = generateTempPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    user.tempPasswordHash = hashedTempPassword;
    user.isTempPassword = true;
    user.tempPasswordExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    if (user.Email) {
      await sendEmail({
        to: user.Email,
        subject: 'MindMate - Temporary Password',
        html: `<p>Your temporary password is: <strong>${tempPassword}</strong></p>
               <p>This password will expire in 5 minutes and can be used only once.</p>
               <p>Please log in and reset your password immediately.</p>`,
      });
    }

    res.status(200).json({ message: 'Temporary password sent to your registered phone and email.' });
  }),

  setNewPassword: asyncHandler(async (req, res) => {
    const { userId, newPassword, role } = req.body;
    if (!userId || !newPassword || !role) return res.status(400).json({ message: 'UserId, newPassword and role are required' });

    let userModel;
    let passwordRegex;
    switch (role) {
      case 'admin': userModel = Admin; passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{10,}$/; break;
      case 'counselor': case 'psychologist': userModel = CounselorPsychologist; passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/; break;
      case 'student': userModel = Student; passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; break;
      default: return res.status(400).json({ message: 'Invalid role' });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password does not meet requirements for this role' });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isSame = await bcrypt.compare(newPassword, user.PasswordHash);
    if (isSame) return res.status(400).json({ message: 'New password must be different from old' });

    user.PasswordHash = await bcrypt.hash(newPassword, 10);
    user.isTempPassword = false;
    user.tempPasswordHash = null;
    user.tempPasswordExpires = null;

    await user.save();
    res.status(200).json({ message: 'Password updated successfully. Please log in again.' });
  }),

};

module.exports = loginController;