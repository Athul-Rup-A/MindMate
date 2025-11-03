const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('../../utils/asyncHandler');
const { generateToken } = require('../../config/jwt');

const sendEmail = require('../../utils/autoEmail')

const Admin = require('../../models/Admin');
const CounselorPsychologist = require('../../models/CounselorPsychologist');
const Feedback = require('../../models/Feedback');
const Report = require('../../models/Report');
const Resource = require('../../models/Resource');
const Student = require('../../models/Student')
const Vent = require('../../models/VentWall');
const Appointment = require('../../models/Appointment')

const regex = {
  username: /^[a-zA-Z0-9_]{4,20}$/,
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

    const { Username, FullName, password, phone, email } = req.body;
    const role = 'admin';

    if (!Username || !FullName || !password || !phone || !email) {
      return res.status(400).json({ message: 'All fields required' });
    };
    if (!regex.username.test(Username)) {
      return res.status(400).json({ message: 'Username must be 4–20 characters, alphanumeric or underscore only' });
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

    const existingUser = await Admin.findOne({ Username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
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
      Username,
      FullName,
      PasswordHash: hashedPassword,
      Role: role,
      Phone: phone,
      Email: email
    });

    const token = generateToken({ _id: newAdmin._id, role });
    res.status(201).json({ token, user: newAdmin });
  }),

  // PROFILE
  getProfile: asyncHandler(async (req, res) => {
    const user = await Admin.findById(req.user._id).select('-PasswordHash -tempPasswordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  }),

  updateProfileRequest: asyncHandler(async (req, res) => {
    const allowed = ['Phone', 'Email'];
    const updates = req.body;

    const isValid = Object.keys(updates).every(field => allowed.includes(field));
    if (!isValid) return res.status(400).json({ message: 'Invalid update fields' });

    const admin = await Admin.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    admin.pendingUpdates = { ...updates, token, expiresAt };
    await admin.save();

    const verifyLink = `${process.env.FRONTEND_URL}/admin/verify-profile-update/${token}`;

    await sendEmail({
      to: admin.Email,
      subject: 'Verify Admin Profile Update',
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your admin profile update.</p>`
    });

    res.status(200).json({ message: 'Verification email sent. Check your inbox.' });
  }),

  verifyProfileUpdate: asyncHandler(async (req, res) => {
    const { token } = req.params;

    const admin = await Admin.findOne({ 'pendingUpdates.token': token });
    if (!admin) return res.status(400).json({ message: 'Invalid or expired link' });

    if (admin.pendingUpdates.expiresAt < new Date()) {
      admin.pendingUpdates = undefined;
      await admin.save();
      return res.status(400).json({ message: 'Token expired' });
    }

    const { Phone, Email } = admin.pendingUpdates;

    if (Phone) admin.Phone = Phone;
    if (Email) admin.Email = Email;

    admin.pendingUpdates = undefined;
    await admin.save();

    res.status(200).json({ message: 'Admin profile updated successfully' });
  }),

  requestPasswordChange: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords required' });

    const admin = await Admin.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(currentPassword, admin.PasswordHash);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect current password' });

    const isSame = await bcrypt.compare(newPassword, admin.PasswordHash);
    if (isSame) return res.status(400).json({ message: 'New password must differ from old' });

    const hashed = await bcrypt.hash(newPassword, 10);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    admin.pendingPasswordChange = { newPasswordHash: hashed, token, expiresAt };
    await admin.save();

    const verifyLink = `${process.env.FRONTEND_URL}/admin/verify-password-change/${token}`;

    await sendEmail({
      to: admin.Email,
      subject: 'Verify Password Change',
      html: `<p>Click <a href="${verifyLink}">here</a> to confirm password change.</p>`
    });

    res.status(200).json({ message: 'Verify link sent to email' });
  }),

  verifyPasswordChange: asyncHandler(async (req, res) => {
    const { token } = req.params;

    const admin = await Admin.findOne({ 'pendingPasswordChange.token': token });
    if (!admin) return res.status(400).json({ message: 'Invalid or expired link' });

    if (admin.pendingPasswordChange.expiresAt < new Date()) {
      admin.pendingPasswordChange = undefined;
      await admin.save();
      return res.status(400).json({ message: 'Token expired' });
    }

    admin.PasswordHash = admin.pendingPasswordChange.newPasswordHash;
    admin.pendingPasswordChange = undefined;
    await admin.save();

    res.status(200).json({ message: 'Password updated. Please log in again.' });
  }),

  // APPROVAL/MG COUNCPSYCH
  getPendingApprovals: asyncHandler(async (req, res) => {
    const pending = await CounselorPsychologist.find({
      ApprovedByAdmin: false,
      isDeleted: { $ne: true }
    });
    res.status(200).json(pending);
  }),

  approveCounselorPsychologist: asyncHandler(async (req, res) => {
    const user = await CounselorPsychologist.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { ApprovedByAdmin: true, Status: 'active' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Counselor/Psychologist approved', user });
  }),

  rejectCounselorPsychologist: asyncHandler(async (req, res) => {
    const user = await CounselorPsychologist.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { Status: 'rejected' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Counselor/Psychologist rejected' });
  }),

  deleteCounselorPsychologistAccount: asyncHandler(async (req, res) => {

    const target = await CounselorPsychologist.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (target.isDeleted)
      return res.status(400).json({ message: 'User already deleted' });

    // Soft delete
    target.isDeleted = true;
    await target.save();

    res.status(200).json({ message: 'Account deleted' });
  }),

  // REPORT MODERATION
  getAllReports: asyncHandler(async (req, res) => {
    const reports = await Report.find().populate('ReporterId', 'AliasId')
      .populate('TargetId', 'FullName AliasId')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  }),

  reviewReport: asyncHandler(async (req, res) => {
    const report = await Report.findByIdAndUpdate(req.params.reportId, { Status: 'reviewed' }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.status(200).json({ message: 'Report marked as reviewed', report });
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
    const admins = await Admin.find({ isDeleted: { $ne: true } }).select('-PasswordHash -tempPasswordHash');
    res.status(200).json(admins);
  }),

  createAdmin: asyncHandler(async (req, res) => {
    const { AliasId, fullName, role, email, phone } = req.body;

    if (!AliasId || !fullName || !role || !email || !phone)
      return res.status(400).json({ message: 'All fields (AliasId, Role, Email, Phone) are required' });

    if (!regex.aliasId.test(AliasId))
      return res.status(400).json({ message: 'Invalid Username format' });

    if (!regex.email.test(email))
      return res.status(400).json({ message: 'Invalid email format' });

    if (!regex.phone.test(phone))
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });

    if (!['admin', 'moderator'].includes(role))
      return res.status(400).json({ message: 'Role must be either admin or moderator' });

    const exists = await Admin.findOne({ AliasId });
    if (exists)
      return res.status(409).json({ message: 'Username already exists' });

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

    try {
      await sendEmail({
        to: email,
        subject: 'MindMate Admin Credentials',
        html: `
             <p>Hello <strong>${AliasId}</strong>,</p>
             <p>You have been added as an <strong>${role}</strong> to the MindMate platform.</p>
             <p><strong>Username:</strong> ${AliasId}</p>
             <p><strong>Temporary Password:</strong> ${tempPassword}</p>
             <p>This password will expire in 5 minutes and must be changed on first login.</p>
             <p>Please login here: <a href="${process.env.ADMIN_PORTAL_URL || 'http://localhost:5173'}/admin/login">MindMate Admin Portal</a></p>
             <br/>
             <p>Regards,<br>MindMate Team</p>
         `
      });
    } catch (err) {
      console.warn('Email not sent:', err.message);
    }

    res.status(201).json({ message: 'Admin/Moderator created and credentials sent to registered email', admin: newAdmin });
  }),

  resendTempPassword: asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin/Moderator not found' });

    const newTempPassword = Math.random().toString(36).slice(-6);
    const hashedTempPassword = await bcrypt.hash(newTempPassword, 10);

    const firstAdmin = await Admin.find().sort({ createdAt: 1 }).limit(1);
    if (firstAdmin[0]?._id.toString() === admin._id.toString()) {
      return res.status(403).json({ message: 'Primary admin is protected.' });
    }

    if (admin._id.toString() === firstAdminIdFromDb.toString()) {
      return res.status(403).json({ message: 'Temporary password cannot be reset for the primary admin.' });
    }

    // Update admin with new temp password and expiry
    admin.tempPasswordHash = hashedTempPassword;
    admin.isTempPassword = true;
    admin.tempPasswordExpires = Date.now() + 5 * 60 * 1000;
    await admin.save();

    if (admin.Email) {
      await sendEmail({
        to: admin.Email,
        subject: 'MindMate - Temporary Password Regenerated',
        html: `
        <p>Hello <strong>${admin.AliasId}</strong>,</p>
        <p>Your new temporary password is: <strong>${newTempPassword}</strong></p>
        <p>This password will expire in 5 minutes and must be changed on your first login.</p>
        <p>Please login here: <a href="${process.env.ADMIN_PORTAL_URL || 'http://localhost:5173'}/admin/login">MindMate Admin Portal</a></p>
        <br/>
        <p>Regards,<br/>MindMate Team</p>
      `
      });
    }

    res.status(200).json({ message: 'New temporary password generated and sent to email and phone.' });
  }),

  updateAdmin: asyncHandler(async (req, res) => {
    const { fullName, email, phone, role } = req.body;

    const admin = await Admin.findById(req.params.adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const firstAdmin = await Admin.findOne().sort({ createdAt: 1 }).lean();

    // Block if someone ELSE tries to update the super admin
    if (
      admin._id.toString() === firstAdmin._id.toString() &&
      req.user._id.toString() !== firstAdmin._id.toString()
    ) {
      return res.status(403).json({ message: 'Super Admin cannot be modified by others' });
    }

    // Block role change for super admin (even by themselves)
    if (admin._id.toString() === firstAdmin._id.toString() && role && role !== admin.Role) {
      return res.status(403).json({ message: 'Super Admin role cannot be changed' });
    }

    admin.FullName = fullName;
    admin.Email = email;
    admin.Phone = phone;
    if (role !== undefined) {
      admin.Role = role;
    }
    await admin.save();

    res.status(200).json({ message: 'Admin updated', admin });
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

    const target = await Admin.findById(targetAdminId);
    if (!target) return res.status(404).json({ message: 'Admin not found' });

    if (target.isDeleted)
      return res.status(400).json({ message: 'Admin already deleted' });

    // Soft delete
    target.isDeleted = true;
    await target.save();

    res.status(200).json({ message: 'Admin deleted' });
  }),

  // STAT
  getDashboardStats: asyncHandler(async (req, res) => {
    const totalAdmins = await Admin.countDocuments({ isDeleted: { $ne: true } });
    const totalCouncPsych = await CounselorPsychologist.countDocuments({ isDeleted: { $ne: true } });
    const totalStudents = await Student.countDocuments();
    const totalReports = await Report.countDocuments();
    const totalVents = await Vent.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    res.status(200).json({ totalAdmins, totalCouncPsych, totalStudents, totalReports, totalVents, totalAppointments });
  }),

  getAllCounselorPsychologists: asyncHandler(async (req, res) => {
    const users = await CounselorPsychologist.find({ isDeleted: { $ne: true } })
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

  getAllAppointments: asyncHandler(async (req, res) => {
    const appointments = await Appointment.find()
      .populate({
        path: 'StudentId',
        select: 'AliasId FullName'
      })
      .populate({
        path: 'CounselorPsychologistId',
        select: 'FullName Role Specialization'
      })
      .sort({ SlotDate: -1, SlotStartTime: 1 });

    res.status(200).json(appointments);
  }),

  updateStudentStatus: asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { Status: status },
      { new: true }
    );

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json({ message: `Student status updated to ${status}`, student });
  }),

  updateCounselorPsychologistStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const counselor = await CounselorPsychologist.findByIdAndUpdate(
      id,
      { Status: status },
      { new: true }
    );

    if (!counselor) return res.status(404).json({ message: 'Counselor/Psychologist not found' });

    res.status(200).json({ message: `Counselor/Psychologist status updated to ${status}`, counselor });
  }),

};

module.exports = AdminController;