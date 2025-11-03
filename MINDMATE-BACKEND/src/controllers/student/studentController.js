const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const asyncHandler = require('../../utils/asyncHandler');
const { generateToken } = require('../../config/jwt');

const sendEmail = require('../../utils/autoEmail')

const Student = require('../../models/Student');
const Appointment = require('../../models/Appointment');
const Vent = require('../../models/VentWall');
const Feedback = require('../../models/Feedback');
const Resource = require('../../models/Resource');
const Report = require('../../models/Report');
const CounselorPsychologist = require('../../models/CounselorPsychologist');

const studentController = {

  // AUTH
  signupStudent: asyncHandler(async (req, res) => {
    const { Username, password, phone, email } = req.body;

    if (!Username || !password || !phone || !email) {
      return res.status(400).json({ message: 'Username, password and phone are required' });
    }
    // Username validation: alphanumeric and 4-20 characters
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(Username)) {
      return res.status(400).json({ message: 'Username must be 4–20 characters, alphanumeric or underscore only' });
    }
    // Password strength: at least 8 characters, with at least 1 letter and 1 number
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one letter and one number',
      });
    }
    // Phone number must be exactly 10 digits
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }
    // Email validation
    if (!/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/.test(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const existingStudent = await Student.findOne({ Username });
    if (existingStudent)
      return res.status(400).json({ message: 'Username already in use' });

    const existingPhone = await Student.findOne({ Phone: phone });
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number is already registered' });
    }

    const existingEmail = await Student.findOne({ Email: email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = await Student.create({
      Username,
      PasswordHash: hashedPassword,
      Phone: phone,
      Email: email,
    });

    const token = generateToken({ _id: newStudent._id, role: 'student' });
    res.status(201).json({ token, student: newStudent });
  }),

  getAvailableCounselorPsychologist: asyncHandler(async (req, res) => {
    const counselorPsychologist = await CounselorPsychologist.find({
      Status: 'active',
      ApprovedByAdmin: true,
    }).select('-PasswordHash');

    res.status(200).json(counselorPsychologist);
  }),

  getCounselorPsychologistById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await CounselorPsychologist.findById(id).select('FullName Username Specialization');
    if (!user) {
      return res.status(404).json({ message: 'Counselor/Psychologist not found' });
    }

    res.status(200).json(user);
  }),

  getMyAppointmentCounselorPsychologists: asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const counselorPsychologistIds = await Appointment.find({ StudentId: studentId })
      .distinct('CounselorPsychologistId');

    const counselorPsychologists = await CounselorPsychologist.find({
      _id: { $in: counselorPsychologistIds },
      ApprovedByAdmin: true,
      Status: 'active',
    }).select('_id FullName Role Specialization');

    res.status(200).json(counselorPsychologists);
  }),

  // PROFILE
  getProfile: asyncHandler(async (req, res) => {
    const profile = await Student.findById(req.user._id)
      .select('-PasswordHash')
      .populate({
        path: 'VentPosts',
        select: '-__v',
      });

    if (!profile) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const profileObj = profile.toObject();
    const appointments = await Appointment.find({ StudentId: req.user.id }).select('-_v');
    res.status(200).json({
      ...profileObj,
      Appointments: appointments,
    });
  }),

  requestPasswordChange: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const student = await Student.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isMatch = await bcrypt.compare(currentPassword, student.PasswordHash);
    if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });

    const isSameAsOld = await bcrypt.compare(newPassword, student.PasswordHash);
    if (isSameAsOld) return res.status(400).json({ message: 'New password must be different' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    student.pendingPasswordChange = { newPasswordHash: hashedNewPassword, token, expiresAt };
    await student.save();

    const verifyLink = `${process.env.FRONTEND_URL}/students/verify-password-change/${token}`;
    await sendEmail({
      to: student.Email,
      subject: 'Confirm Password Change',
      html: `<p>Click <a href="${verifyLink}">here</a> to confirm your password change.</p>
           <p>If you didn't request this, change your password immediately.</p>`
    });

    res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
  }),

  verifyPasswordChange: asyncHandler(async (req, res) => {
    const { token } = req.params;

    const student = await Student.findOne({ 'pendingPasswordChange.token': token });
    if (!student) return res.status(400).json({ message: 'Invalid or expired token' });

    if (student.pendingPasswordChange.expiresAt < new Date()) {
      student.pendingPasswordChange = undefined;
      await student.save();
      return res.status(400).json({ message: 'Token expired' });
    }

    student.PasswordHash = student.pendingPasswordChange.newPasswordHash;
    student.pendingPasswordChange = undefined;
    await student.save();

    res.status(200).json({ message: 'Password updated successfully. Please log in again.' });
  }),

  updateProfileRequest: asyncHandler(async (req, res) => {
    const allowedFields = ['Phone', 'Email'];
    const updates = req.body;

    if (!Object.keys(updates).every(field => allowedFields.includes(field))) {
      return res.status(400).json({ message: 'Invalid fields in update' });
    }

    const student = await Student.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    // Save pending updates
    student.pendingUpdates = { ...updates, token, expiresAt };
    await student.save();

    // Send verification email
    const verifyLink = `${process.env.FRONTEND_URL}/students/verify-profile-update/${token}`;
    await sendEmail({
      to: student.Email,
      subject: 'Verify Your Profile Update',
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your profile update.</p>
           <p>If you didn't request this, someone else might be using your account. Change your password immediately.</p>`
    });

    res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
  }),

  verifyProfileUpdate: asyncHandler(async (req, res) => {
    const { token } = req.params;

    const student = await Student.findOne({ 'pendingUpdates.token': token });
    if (!student) return res.status(400).json({ message: 'Invalid or expired token' });

    if (student.pendingUpdates.expiresAt < new Date()) {
      student.pendingUpdates = undefined;
      await student.save();
      return res.status(400).json({ message: 'Token expired' });
    }

    const { Phone, Email } = student.pendingUpdates;
    if (Phone) student.Phone = Phone;
    if (Email) student.Email = Email;

    student.pendingUpdates = undefined;
    await student.save();

    res.status(200).json({ message: 'Profile updated successfully' });
  }),

  // APPOINTMENTS
  createAppointment: asyncHandler(async (req, res) => {
    const { CounselorPsychologistId, SlotDate, SlotStartTime, SlotEndTime } = req.body;
    if (!CounselorPsychologistId || !SlotDate || !SlotStartTime || !SlotEndTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(CounselorPsychologistId)) {
      return res.status(400).json({ message: 'Invalid Counselor ID' });
    }

    // Validate Date
    const dateObj = new Date(SlotDate);
    if (isNaN(dateObj)) {
      return res.status(400).json({ message: 'Invalid Slot Date' });
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(SlotStartTime) || !timeRegex.test(SlotEndTime)) {
      return res.status(400).json({ message: 'Invalid time format (expected HH:mm)' });
    }

    // Check SlotStartTime < SlotEndTime
    if (SlotStartTime >= SlotEndTime) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // Prevent double booking by same student for same time with same counselor
    const existingAppointment = await Appointment.findOne({
      StudentId: req.user._id,
      CounselorPsychologistId,
      SlotDate: dateObj,
      SlotStartTime,
      Status: { $in: ['pending', 'confirmed'] },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'You already have an appointment at this time with this counselor.' });
    };

    const appointment = await Appointment.create({
      CounselorPsychologistId,
      SlotDate: dateObj,
      SlotStartTime,
      SlotEndTime,
      StudentId: req.user._id,
      ReminderSent: false,
      Status: 'pending',
    });

    res.status(201).json(appointment);
  }),

  getMyAppointments: asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ StudentId: req.user._id })
      .populate('CounselorPsychologistId', 'FullName  Specialization Role AvailabilitySlots')
      .sort({ SlotDate: -1 });

    if (!appointments) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointments);
  }),

  updateAppointment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const allowedFields = ['SlotDate', 'SlotStartTime', 'SlotEndTime', 'Status'];
    const isValidUpdate = Object.keys(updateData).every((key) =>
      allowedFields.includes(key)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ message: 'Invalid fields in update' });
    }

    if (updateData.SlotDate && isNaN(new Date(updateData.SlotDate))) {
      return res.status(400).json({ message: 'Invalid Slot Date' });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (
      (updateData.SlotStartTime && !timeRegex.test(updateData.SlotStartTime)) ||
      (updateData.SlotEndTime && !timeRegex.test(updateData.SlotEndTime))
    ) {
      return res.status(400).json({ message: 'Invalid time format (expected HH:mm)' });
    }

    if (
      updateData.SlotStartTime &&
      updateData.SlotEndTime &&
      updateData.SlotStartTime >= updateData.SlotEndTime
    ) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    if (
      updateData.Status &&
      !['pending', 'confirmed', 'rejected', 'completed'].includes(updateData.Status)
    ) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, StudentId: req.user._id },
      updateData,
      { new: true }
    );
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json(appointment);
  }),

  cancelAppointment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const studentId = req.user._id;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.StudentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // Get student and counselor details
    const student = await Student.findById(studentId);
    const counselor = await CounselorPsychologist.findById(appointment.CounselorPsychologistId);

    console.log("Appointment cancel details:");
    console.log({
      counselorEmail: counselor?.Email,
      studentUsername: student?.Username,
      counselorName: counselor?.FullName,
      slotDate: appointment?.SlotDate,
      slotStart: appointment?.SlotStartTime,
      slotEnd: appointment?.SlotEndTime,
      reason
    });

    if (counselor && counselor.Email) {

      try {
        await sendEmail({
          to: counselor.Email,
          subject: `Appointment Cancelled by ${student.Username}`,
          html: `
        <h3>Appointment Cancellation Notice</h3>
        <p>Dear ${counselor.FullName || 'Counselor'},</p>
        <p>The student <b>${student.Username}</b> has cancelled their appointment.</p>
        <p><b>Original Appointment Details:</b></p>
        <ul>
        <li><b>Date:</b> ${appointment.Date}</li>
        <li><b>Time:</b> ${appointment.StartTime} - ${appointment.EndTime}</li>
        </ul>
        ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}
        <br/>
        <p>Please update your schedule accordingly.</p>
        <p>Regards,<br/>MindMate System</p>
        `,
        });
      } catch (err) {
        console.log('Email not sent: sendgrid', err.message);
      }
    }

    await Appointment.findByIdAndDelete(id);

    res.json({ message: 'Appointment deleted and counselor notified by email.' });
  }),

  // VENTS
  createVent: asyncHandler(async (req, res) => {
    const { Topic, Content } = req.body;
    if (!Topic || !Content)
      return res.status(400).json({ message: 'Topic and Content required' });

    if (Topic.length > 10) {
      return res.status(400).json({ message: 'Topic is too long (max 10 characters)' });
    }

    if (Content.length < 10) {
      return res.status(400).json({ message: 'Content must be at least 10 characters long' });
    }

    const vent = await Vent.create({
      Topic,
      Content,
      StudentId: req.user._id,
      Likes: [],
      Reports: [],
    });

    res.status(201).json(vent);
  }),

  getMyVents: asyncHandler(async (req, res) => {
    const vents = await Vent.find({ StudentId: req.user._id }).sort({
      CreatedAt: -1,
    });

    if (!vents) {
      return res.status(404).json({ message: 'Vent not found' });
    }

    res.status(200).json(vents);
  }),

  // GET ALL VENTS (Community Wall – Anonymous)
  getAllVents: asyncHandler(async (req, res) => {
    const vents = await Vent.find().sort({ createdAt: -1 })
      .select('Topic Content Likes Reports StudentId createdAt')
    res.status(200).json(vents);
  }),

  likeVent: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid Vent ID' });

    const vent = await Vent.findById(id);
    if (!vent)
      return res.status(404).json({ message: 'Vent not found' });

    const userId = req.user._id.toString();
    const index = vent.Likes.findIndex(uid => uid.toString() === userId);

    if (index === -1) {
      // Not yet liked → Like it
      vent.Likes.push(userId);
    } else {
      // Already liked → Unlike it
      vent.Likes.splice(index, 1);
    }

    await vent.save();
    res.status(200).json({ Likes: vent.Likes });
  }),

  reportVent: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid Vent ID' });

    const vent = await Vent.findById(id);
    if (!vent)
      return res.status(404).json({ message: 'Vent not found' });

    const userId = req.user._id.toString();
    const index = vent.Reports.findIndex(uid => uid.toString() === userId);

    if (index === -1) {
      // Not yet reported → Report it
      vent.Reports.push(userId);
    } else {
      // Already reported → Unreport it
      vent.Reports.splice(index, 1);
    }

    await vent.save();
    res.status(200).json({ Reports: vent.Reports });
  }),

  updateVent: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Vent ID' });
    }

    const allowedFields = ['Topic', 'Content'];
    const isValidUpdate = Object.keys(updateData).every((key) =>
      allowedFields.includes(key)
    );
    if (!isValidUpdate) {
      return res.status(400).json({ message: 'Only Topic and Content can be updated' });
    }

    if (updateData.Topic && updateData.Topic.length > 10) {
      return res.status(400).json({ message: 'Topic is too long (max 10 characters)' });
    }

    if (updateData.Content && updateData.Content.length < 10) {
      return res.status(400).json({ message: 'Content must be at least 10 characters long' });
    }

    const vent = await Vent.findOneAndUpdate(
      { _id: id, StudentId: req.user._id },
      updateData,
      { new: true }
    );
    if (!vent) return res.status(404).json({ message: 'Vent not found' });
    res.status(200).json(vent);
  }),

  deleteVent: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Vent ID' });
    }

    const vent = await Vent.findOneAndDelete({
      _id: id,
      StudentId: req.user._id,
    });
    if (!vent) return res.status(404).json({ message: 'Vent not found' });
    res.status(200).json({ message: 'Vent deleted' });
  }),

  // FEEDBACKS
  createFeedback: asyncHandler(async (req, res) => {
    const { Rating, Comment, Type, CounselorPsychologistId, AppointmentId } = req.body;

    // Validate Rating
    if (Rating === undefined || Rating < 1 || Rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate Type
    const validTypes = ['session', 'platform', 'content'];
    if (!Type || !validTypes.includes(Type)) {
      return res.status(400).json({ message: 'Invalid or missing feedback type' });
    }

    let resolvedAppointmentId = AppointmentId;

    // Auto-resolve latest appointment if not provided and type is session
    if (Type === 'session' && !AppointmentId && CounselorPsychologistId) {
      const recentAppointment = await Appointment.findOne({
        StudentId: req.user._id,
        CounselorPsychologistId,
      })
        .sort({ SlotDate: -1 });

      if (!recentAppointment) {
        return res.status(400).json({ message: 'No recent appointment found for this counselor' });
      }

      resolvedAppointmentId = recentAppointment._id;
    };

    // Validate session is over
    if (Type === 'session') {
      if (!resolvedAppointmentId) {
        return res.status(400).json({ message: 'Missing appointment reference for session feedback' });
      }

      const appointment = await Appointment.findById(resolvedAppointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const endTime = new Date(`${appointment.SlotDate} ${appointment.SlotEndTime}`);
      if (endTime > new Date()) {
        return res.status(400).json({ message: 'Feedback can only be submitted after the session is completed' });
      }
    };

    const feedback = await Feedback.create({
      StudentId: req.user._id,
      CounselorPsychologistId: CounselorPsychologistId || null,
      AppointmentId: resolvedAppointmentId || null,
      Rating,
      Comment,
      Type,
    });

    res.status(201).json(feedback);
  }),

  getMyFeedbacks: asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find({ StudentId: req.user._id })
      .populate('CounselorPsychologistId', 'FullName')
      .populate('AppointmentId', 'SlotDate SlotStartTime SlotEndTime')
      .sort({
        CreatedAt: -1,
      });

    if (!feedbacks) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(feedbacks);
  }),

  getCounPsychRatings: asyncHandler(async (req, res) => {
    const ratings = await Feedback.aggregate([
      {
        $match: {
          Type: 'session',
          CounselorPsychologistId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$CounselorPsychologistId',
          averageRating: { $avg: '$Rating' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          counPsychId: '$_id',
          averageRating: { $round: ['$averageRating', 1] },
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(ratings);
  }),

  updateFeedback: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Feedback ID' });
    }

    const allowedFields = ['Rating', 'Comment', 'Type'];
    const isValidUpdate = Object.keys(updateData).every(field =>
      allowedFields.includes(field)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ message: 'Invalid fields in update' });
    }

    // Field-level validation
    if (updateData.Rating && (updateData.Rating < 1 || updateData.Rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (updateData.Type) {
      const validTypes = ['session', 'platform', 'content'];
      if (!validTypes.includes(updateData.Type)) {
        return res.status(400).json({ message: 'Invalid feedback type' });
      }
    }

    const feedback = await Feedback.findOneAndUpdate(
      { _id: id, StudentId: req.user._id },
      updateData,
      { new: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json(feedback);
  }),

  deleteFeedback: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Feedback ID' });
    }

    const deleted = await Feedback.findOneAndDelete({
      _id: id,
      StudentId: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json({ message: 'Feedback deleted' });
  }),

  getAllApprovedCounselorPsychologist: asyncHandler(async (req, res) => {
    const counselorPsychologist = await CounselorPsychologist.find({
      Status: 'active',
      ApprovedByAdmin: true,
    }).select('_id FullName Specialization');
    res.status(200).json(counselorPsychologist);
  }),

  // RESOURCES (VIEW ONLY)
  getResources: asyncHandler(async (req, res) => {
    const resources = await Resource.find();

    if (!resources) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json(resources);
  }),

  getResourceById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Resource ID' });
    }

    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.status(200).json(resource);
  }),

  // REPORTS
  createReport: asyncHandler(async (req, res) => {
    const { TargetId, TargetUsername, TargetType, Reason, OtherReason } = req.body;

    if (!TargetId || !Reason) {
      return res.status(400).json({ message: 'TargetId and Reason are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(TargetId)) {
      return res.status(400).json({ message: 'Invalid TargetId format' });
    }

    const validReasons = ['spam', 'abuse', 'offensive', 'harassment', 'misinformation', 'other'];
    if (!validReasons.includes(Reason)) {
      return res.status(400).json({ message: 'Invalid Reason value' });
    }

    const validTypes = ['CounselorPsychologist', 'Resource'];
    if (!validTypes.includes(TargetType)) {
      return res.status(400).json({ message: 'Invalid TargetType' });
    }

    // if Reason is 'other', ensure OtherReason is present
    let finalReason = Reason;
    let otherReasonField = undefined;
    if (Reason === 'other') {
      if (!OtherReason || String(OtherReason).trim().length < 3) {
        return res.status(400).json({ message: 'Please provide a custom reason for "other".' });
      }

      otherReasonField = OtherReason.trim();
    }

    const report = await Report.create({
      ReporterId: req.user._id,
      TargetId,
      TargetUsername: TargetType === 'CounselorPsychologist' ? TargetUsername : undefined,
      TargetType,
      Reason: finalReason,
      OtherReason: otherReasonField,
    });

    let targetUserEmail = null;
    let targetUserName = "";

    // CounselorPsychologist
    if (TargetType === 'CounselorPsychologist') {
      const target = await CounselorPsychologist.findById(TargetId);
      targetUserEmail = target?.Email;
      targetUserName = target?.FullName || "Counselor";
    }

    // Resource
    if (TargetType === 'Resource') {
      const resource = await Resource.findById(TargetId).populate("CreatedBy", "Email Username");
      targetUserEmail = resource?.CreatedBy?.Email;
      targetUserName = resource?.CreatedBy?.Username || "User";
    }

    if (targetUserEmail) {
      const reporter = await Student.findById(req.user._id).select("Username");

      try {
        await sendEmail({
          to: targetUserEmail,
          subject: `⚠️ You have been reported on MindMate`,
          html: `
          <h3>Report Notification</h3>
          <p>Dear ${targetUserName},</p>
          <p>This is to inform you that you have been reported by (<b>${reporter?.Username}</b>).</p>
          <p><b>Reason:</b> ${Reason}</p>
          ${OtherReason ? `<p><b>Details:</b> ${OtherReason}</p>` : ''}
          <p>The MindMate admin team will review the report shortly.</p>
          <br/>
          <p>Regards,<br/>MindMate Support Team</p>
          `,
        });
        console.log(`Report email sent to ${targetUserEmail}`);
      } catch (err) {
        console.error('Email not sent:', err.message);
      }
    }

    res.status(201).json({ message: 'Report submitted and target notified via email', report });
  }),

  getMyReports: asyncHandler(async (req, res) => {
    try {
      const reports = await Report.find({ ReporterId: req.user._id })
        .lean()
        .sort({ createdAt: -1 });

      const enhancedReports = await Promise.all(
        reports.map(async (report) => {
          let targetName = 'N/A';

          if (report.TargetType === 'CounselorPsychologist') {
            try {
              const counselor = await CounselorPsychologist.findOne({ Username: report.TargetUsername }).lean();

              if (!counselor) {
                targetName = 'N/A';
              } else {
                targetName = counselor.FullName;
              }
            } catch (error) {
              res.status(500).json({ message: 'Error finding counselor:', err });
            }
          }

          else if (report.TargetType === 'Resource') {
            try {
              if (mongoose.Types.ObjectId.isValid(report.TargetId)) {
                const resource = await Resource.findById(String(report.TargetId)).lean();
                if (resource) targetName = resource.title || 'N/A';
              }
            } catch (err) {
              res.status(500).json({ message: 'Error fetching resource:', err });
            }
          }

          return {
            ...report,
            TargetName: targetName,
            DisplayReason: report.Reason === 'other' ? (report.OtherReason || 'Other') : report.Reason
          };
        })
      );

      res.json(enhancedReports);
    } catch (err) {
      res.status(500).json({ message: 'Error in getMyReports:', err });
    }
  }),

  deleteReport: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Report ID' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only the user who created the report can delete it
    if (!report.ReporterId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to delete this report' });
    }

    await report.deleteOne();
    res.status(200).json({ message: 'Report deleted successfully' });
  }),

};

module.exports = studentController;