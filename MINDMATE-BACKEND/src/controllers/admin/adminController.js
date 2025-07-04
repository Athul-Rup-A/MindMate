const bcrypt = require('bcryptjs');
const asyncHandler = require('../../utils/asyncHandler');
const { generateToken } = require('../../config/jwt');

const Admin = require('../../models/Admin');
const CounselorPsychologist = require('../../models/CounselorPsychologist');
const Feedback = require('../../models/Feedback');
const Report = require('../../models/Report');
const Resource = require('../../models/Resource');
const SOS = require('../../models/SOSLog')
const Student = require('../../models/Student')
const Vent = require('../../models/VentWall');

const generateTempPassword = require('../../utils/tempPassGen')
const sendEmail = require('../../utils/autoEmail');
const sendSMS = (phone, message) => {
  console.log(`Sending SMS to ${phone}: ${message}`);
};

const regex = {
  aliasId: /^[a-zA-Z0-9_]{4,20}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{10,}$/,
  phone: /^[6-9]\d{9}$/,
  email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
};

const AdminController = {

  // AUTH
  signupAdmin: asyncHandler(async (req, res) => {
    const existingAdmins = await Admin.countDocuments();

    if (existingAdmins > 0) {
      return res.status(403).json({ message: 'Signup not allowed. Admin already exists.' });
    };

    const { AliasId, FullName, password, role, phone, email } = req.body;

    if (!AliasId || !FullName || !password || !role || !phone || !email) {
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
      FullName,
      PasswordHash: hashedPassword,
      Role: role,
      Phone: phone,
      Email: email
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

    const tempPassword = generateTempPassword();
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

  // APPROVAL/MG COUNCPSYCH
  getPendingApprovals: asyncHandler(async (req, res) => {
    const pending = await CounselorPsychologist.find({ ApprovedByAdmin: false });
    res.status(200).json(pending);
  }),

  approveCounselorPsychologist: asyncHandler(async (req, res) => {
    const user = await CounselorPsychologist.findByIdAndUpdate(req.params.id, { ApprovedByAdmin: true, Status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Counselor/Psychologist approved', user });
  }),

  rejectCounselorPsychologist: asyncHandler(async (req, res) => {
    const user = await CounselorPsychologist.findByIdAndUpdate(req.params.id, { Status: 'rejected' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Counselor/Psychologist rejected' });
  }),

  deleteCounselorPsychologistAccount: asyncHandler(async (req, res) => {
    const deleted = await CounselorPsychologist.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Account deleted' });
  }),

  // REPORT MODERATION
  getAllReports: asyncHandler(async (req, res) => {
    const reports = await Report.find().populate('ReporterId', 'AliasId')
      .populate('TargetId', 'FullName AliasId')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  }),

  resolveReport: asyncHandler(async (req, res) => {
    const report = await Report.findByIdAndUpdate(req.params.reportId, { Status: 'resolved' }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.status(200).json({ message: 'Report resolved', report });
  }),

  // CONTENT MODERATION
  getAllResources: asyncHandler(async (req, res) => {
    const resources = await Resource.find();
    res.status(200).json(resources);
  }),

  getAllFeedbacks: asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find().populate('StudentId', 'AliasId');
    res.status(200).json(feedbacks);
  }),

  deleteVentPost: asyncHandler(async (req, res) => {
    const deleted = await Vent.findByIdAndDelete(req.params.ventId);
    if (!deleted) return res.status(404).json({ message: 'Vent not found' });

    res.status(200).json({ message: 'Vent deleted' });
  }),

  deleteResource: asyncHandler(async (req, res) => {
    const deleted = await Resource.findByIdAndDelete(req.params.resourceId);
    if (!deleted) return res.status(404).json({ message: 'Resource not found' });

    res.status(200).json({ message: 'Resource deleted' });
  }),

  deleteFeedback: asyncHandler(async (req, res) => {
    const deleted = await Feedback.findByIdAndDelete(req.params.feedbackId);
    if (!deleted) return res.status(404).json({ message: 'Feedback not found' });

    res.status(200).json({ message: 'Feedback deleted' });
  }),

  // ADMIN/MODERATOR MGMT
  getAllAdmins: asyncHandler(async (req, res) => {
    const admins = await Admin.find();
    res.status(200).json(admins);
  }),

  createAdmin: asyncHandler(async (req, res) => {
    const { AliasId, fullName, role, email, phone } = req.body;

    if (!AliasId || !fullName || !role || !email || !phone)
      return res.status(400).json({ message: 'All fields (AliasId, Role, Email, Phone) are required' });

    if (!regex.aliasId.test(AliasId))
      return res.status(400).json({ message: 'Invalid Alias ID format' });

    if (!regex.email.test(email))
      return res.status(400).json({ message: 'Invalid email format' });

    if (!regex.phone.test(phone))
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });

    if (!['admin', 'moderator'].includes(role))
      return res.status(400).json({ message: 'Role must be either admin or moderator' });

    const exists = await Admin.findOne({ AliasId });
    if (exists)
      return res.status(409).json({ message: 'Alias ID already exists' });

    const tempPassword = Math.random().toString(36).slice(-6);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    const newAdmin = await Admin.create({
      AliasId,
      FullName: fullName,
      Role: role,
      Email: email,
      Phone: phone,
      PasswordHash: hashedTempPassword,
      isTempPassword: true,
      tempPasswordExpires: Date.now() + 5 * 60 * 1000,
    });

    await sendEmail({
      to: email,
      subject: 'MindMate Admin Credentials',
      html: `
            <p>Hello <strong>${AliasId}</strong>,</p>
            <p>You have been added as an <strong>${role}</strong> to the MindMate platform.</p>
            <p><strong>Alias ID:</strong> ${AliasId}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p>This password will expire in 5 minutes and must be changed on first login.</p>
            <p>Please login here: <a href="${process.env.ADMIN_PORTAL_URL || 'http://localhost:3000'}/admin/login">MindMate Admin Portal</a></p>
            <br/>
            <p>Regards,<br>MindMate Team</p>
        `
    });

    res.status(201).json({ message: 'Admin/Moderator created and credentials sent', admin: newAdmin });
  }),

  resendTempPassword: asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin/Moderator not found' });

    const newTempPassword = Math.random().toString(36).slice(-6);
    const hashedTempPassword = await bcrypt.hash(newTempPassword, 10);

    // Update admin with new temp password and expiry
    admin.tempPasswordHash = hashedTempPassword;
    admin.isTempPassword = true;
    admin.tempPasswordExpires = Date.now() + 5 * 60 * 1000;
    await admin.save();

    sendSMS(admin.Phone, `Your new temporary password is: ${newTempPassword}. It expires in 5 minutes.`);
    if (admin.Email) {
      await sendEmail({
        to: admin.Email,
        subject: 'MindMate - Temporary Password Regenerated',
        html: `
        <p>Hello <strong>${admin.AliasId}</strong>,</p>
        <p>Your new temporary password is: <strong>${newTempPassword}</strong></p>
        <p>This password will expire in 5 minutes and must be changed on your first login.</p>
        <p>Please login here: <a href="${process.env.ADMIN_PORTAL_URL || 'http://localhost:3000'}/admin/login">MindMate Admin Portal</a></p>
        <br/>
        <p>Regards,<br/>MindMate Team</p>
      `
      });
    }

    res.status(200).json({ message: 'New temporary password generated and sent to email and phone.' });
  }),

  deleteAdmin: asyncHandler(async (req, res) => {
    const requestingAdminId = req.user._id;
    const targetAdminId = req.params.adminId;

    // Get all admins sorted by creation time
    const earliestAdmin = await Admin.findOne().sort({ createdAt: 1 });
    if (!earliestAdmin) return res.status(500).json({ message: 'No admin found' });

    // Only the first admin can delete
    if (requestingAdminId.toString() !== earliestAdmin._id.toString())
      return res.status(403).json({ message: 'Only the first registered admin can delete other admins' });

    if (requestingAdminId === targetAdminId)
      return res.status(403).json({ message: 'You cannot delete your own account' });

    const deleted = await Admin.findByIdAndDelete(targetAdminId);
    if (!deleted) return res.status(404).json({ message: 'Admin not found' });

    res.status(200).json({ message: 'Admin deleted' });
  }),

  // STAT
  getDashboardStats: asyncHandler(async (req, res) => {
    const totalAdmins = await Admin.countDocuments();
    const totalCouncPsych = await CounselorPsychologist.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalReports = await Report.countDocuments();
    const totalVents = await Vent.countDocuments();

    res.status(200).json({ totalAdmins, totalCouncPsych, totalStudents, totalReports, totalVents });
  }),

  getAllCounselorPsychologists: asyncHandler(async (req, res) => {
    const users = await CounselorPsychologist.find()
      .select('-PasswordHash -tempPasswordHash')
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  }),

  getAllStudents: asyncHandler(async (req, res) => {
    const students = await Student.find()
      .select('-PasswordHash -tempPasswordHash')
      .sort({ createdAt: -1 });
    res.status(200).json(students);
  }),

  getAllVents: asyncHandler(async (req, res) => {
    const vents = await Vent.find().populate('StudentId', 'AliasId')
      .populate('Likes', 'AliasId')
      .populate('Reports', 'AliasId')
      .sort({ createdAt: -1 });

    res.status(200).json(vents);
  }),

  getAllSOS: asyncHandler(async (req, res) => {
    const sos = await SOS.find()
      .populate({
        path: 'StudentId',
        select: 'AliasId FullName'
      })
      .populate({
        path: 'AlertedTo',
        select: 'FullName'
      })
      .sort({ TriggeredAt: -1 });

    res.status(200).json(sos);
  }),

};

module.exports = AdminController;