const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const asyncHandler = require('../../utils/asyncHandler');
const { generateToken } = require('../../config/jwt');

const sendEmail = require('../../utils/autoEmail')
// Simulated SMS sending function
const sendSMS = (phone, message) => {
  console.log(`Sending SMS to ${phone}: ${message}`);
};

const Student = require('../../models/Student');
const Appointment = require('../../models/Appointment');
const Vent = require('../../models/VentWall');
const Feedback = require('../../models/Feedback');
const SOSLog = require('../../models/SOSLog');
const Resource = require('../../models/Resource');
const Report = require('../../models/Report');
const CounselorPsychologist = require('../../models/CounselorPsychologist');

const studentController = {

  // AUTH
  signupStudent: asyncHandler(async (req, res) => {
    const { AliasId, password, phone, email } = req.body;

    if (!AliasId || !password || !phone || !email) {
      return res.status(400).json({ message: 'Alias ID, password and phone are required' });
    }
    // AliasId validation: alphanumeric and 4-20 characters
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(AliasId)) {
      return res.status(400).json({ message: 'Alias ID must be 4–20 characters, alphanumeric or underscore only' });
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
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const existingStudent = await Student.findOne({ AliasId });
    if (existingStudent)
      return res.status(400).json({ message: 'Alias ID already in use' });

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
      AliasId,
      PasswordHash: hashedPassword,
      Phone: phone,
      Email: email,
    });

    const token = generateToken({ _id: newStudent._id, role: 'student' });
    res.status(201).json({ token, student: newStudent });
  }),

  loginStudent: asyncHandler(async (req, res) => {
    const { AliasId, password } = req.body;
    if (!AliasId || !password) {
      return res.status(400).json({ message: 'Alias ID and password are required' });
    }
    const student = await Student.findOne({ AliasId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    let isMatch = false;

    if (student.isTempPassword) {
      // 1. Check if temp password is expired    
      if (!student.tempPasswordExpires || student.tempPasswordExpires < Date.now()) {
        return res.status(403).json({ message: 'Temporary password expired. Please reset again.' });
      }

      // 2. Compare with tempPasswordHash (new separate field)
      isMatch = await bcrypt.compare(password, student.tempPasswordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // 3. Invalidate temp password after one use
      student.isTempPassword = false;
      student.tempPasswordExpires = null;
      student.tempPasswordHash = null; // clear temp hash as well
      await student.save();

      // 4. Return token + flag to force password change on client side
      return res.status(200).json({
        token: generateToken({ _id: student._id, role: 'student' }),
        student,
        mustChangePassword: true,
        message: 'Logged in with temporary password. Please change your password immediately.',
      });
    } else {
      // 5. Check permanent password normally
      isMatch = await bcrypt.compare(password, student.PasswordHash);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid credentials' });

      const token = generateToken({ _id: student._id, role: 'student' });
      return res.status(200).json({ token, student });
    }
  }),
  forgotAliasIdByPhone: asyncHandler(async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const student = await Student.findOne({ Phone: phone });
    if (!student) return res.status(404).json({ message: 'No account found for this phone number' });

    // Send SMS
    sendSMS(phone, `Your Alias ID (Username) is: ${student.AliasId}`);

    // Send Email if available
    if (student.Email) {
      await sendEmail({
        to: student.Email,
        subject: 'MindMate - Your Alias ID',
        html: `<p>Hello,</p><p>Your Alias ID (username) is: <strong>${student.AliasId}</strong></p>`,
      });
    }

    res.status(200).json({ message: 'Alias ID sent to your registered phone number and email.' });
  }),

  forgotPasswordByPhone: asyncHandler(async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const student = await Student.findOne({ Phone: phone });
    if (!student) return res.status(404).json({ message: 'No account found for this phone number' });

    const tempPassword = Math.random().toString(36).slice(-8); // Simple temp password
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    // Save temp password hash and flags
    student.tempPasswordHash = hashedTempPassword;
    student.isTempPassword = true;
    student.tempPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 mins expiry
    await student.save();

    // Send SMS
    sendSMS(phone, `Your temporary password is: ${tempPassword}. It expires in 5 minutes.`);

    // Send Email if available
    if (student.Email) {
      await sendEmail({
        to: student.Email,
        subject: 'MindMate - Temporary Password',
        html: `
        <p>Hello,</p>
        <p>Your temporary password is: <strong>${tempPassword}</strong></p>
        <p>This password will expire in 5 minutes and can be used only once.</p>
        <p>Please log in and reset your password immediately.</p>
      `,
      });
    }

    res.status(200).json({ message: 'Temporary password sent to your registered phone number and email.' });
  }),

  setNewPassword: asyncHandler(async (req, res) => {
    const { studentId, newPassword } = req.body;
    if (!studentId || !newPassword) {
      return res.status(400).json({ message: 'Student ID and new password required' });
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one letter and one number',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isSame = await bcrypt.compare(newPassword, student.PasswordHash);
    if (isSame) {
      return res.status(400).json({ message: 'New password must be different from the old one.' });
    }

    student.PasswordHash = await bcrypt.hash(newPassword, 10);
    student.isTempPassword = false;
    student.tempPasswordExpires = null;
    student.tempPasswordHash = null; // clear temp hash as well

    await student.save();
    res.status(200).json({ message: 'Password updated successfully. Please log in again.' });
  }),

  getAvailableCounselorPsychologist: asyncHandler(async (req, res) => {
    const counselorPsychologist = await CounselorPsychologist.find({
      Status: 'active',
      ApprovedByAdmin: true,
    }).select('-PasswordHash');

    res.status(200).json(counselorPsychologist);
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
    const appointments = await Appointment.find({ StudentId: req.user._id }).select('-__v');
    res.status(200).json({
      ...profileObj,
      Appointments: appointments,
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, student.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Password strength for new password
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long and include at least one letter and one number',
      });
    }

    // Check if new password is the same as current password
    const isSameAsOld = await bcrypt.compare(newPassword, student.PasswordHash);
    if (isSameAsOld) {
      return res.status(400).json({ message: 'New password must be different from the old one' });
    }

    const salt = await bcrypt.genSalt(10);
    student.PasswordHash = await bcrypt.hash(newPassword, salt);

    await student.save();

    res.status(200).json({ message: 'Password updated successfully' });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const updates = req.body;
    const allowedFields = ['Phone', 'Status'];
    const updateKeys = Object.keys(updates);

    // Check for invalid fields
    const isValidUpdate = updateKeys.every(key => allowedFields.includes(key));
    if (!isValidUpdate) {
      return res.status(400).json({ message: 'Invalid update fields' });
    }

    // Validate Phone
    if (updates.Phone && !/^\+?\d{7,15}$/.test(updates.Phone)) {
      return res.status(400).json({ message: 'Phone must be a valid phone number' });
    }

    // Validate Status (if present)
    if (updates.Status && !['active', 'pending', 'banned'].includes(updates.Status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await Student.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select('-PasswordHash');

    res.status(200).json(updated);
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

    const appointment = await Appointment.create({
      CounselorPsychologistId,
      SlotDate: dateObj,
      SlotStartTime,
      SlotEndTime,
      StudentId: req.user._id,
      ReminderSent: false,
      Status: 'pending',
      CreatedAt: new Date(),
    });
    res.status(201).json(appointment);
  }),

  getMyAppointments: asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ StudentId: req.user._id });

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findOneAndDelete({
      _id: id,
      StudentId: req.user._id,
    });
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ message: 'Appointment canceled' });
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
    const alreadyLiked = vent.Likes.some(id => id.toString() === userId);
    if (alreadyLiked)
      return res.status(400).json({ message: 'Already liked this vent' });

    vent.Likes.push(userId);
    await vent.save();
    res.status(200).json({ Likes: vent.Likes.length });
  }),

  reportVent: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid Vent ID' });

    const vent = await Vent.findById(id);
    if (!vent)
      return res.status(404).json({ message: 'Vent not found' });

    const userId = req.user._id.toString();
    const alreadyReported = vent.Reports.some(id => id.toString() === userId);
    if (alreadyReported)
      return res.status(400).json({ message: 'Already reported this vent' });

    vent.Reports.push(userId);
    await vent.save();
    res.status(200).json({ message: 'Reported successfully', Reports: vent.Reports.length });
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
    const { Rating, Comment, Type } = req.body;

    // Validate Rating
    if (Rating === undefined || Rating < 1 || Rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate Type
    const validTypes = ['session', 'platform', 'content', 'SOS'];
    if (!Type || !validTypes.includes(Type)) {
      return res.status(400).json({ message: 'Invalid or missing feedback type' });
    }

    const feedback = await Feedback.create({
      StudentId: req.user._id,
      Rating,
      Comment,
      Type,
    });

    res.status(201).json(feedback);
  }),

  getMyFeedbacks: asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find({ StudentId: req.user._id }).sort({
      CreatedAt: -1,
    });

    if (!feedbacks) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(feedbacks);
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
      const validTypes = ['session', 'platform', 'content', 'SOS'];
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

  // SOS
  triggerSOS: asyncHandler(async (req, res) => {
    const { AlertedTo, Method } = req.body;
    if (!AlertedTo || !Array.isArray(AlertedTo) || AlertedTo.length === 0)
      return res
        .status(400)
        .json({ message: 'AlertedTo array with at least one entry required' });

    // Validate each AlertedTo entry as ObjectId
    const invalidIds = AlertedTo.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: 'One or more AlertedTo IDs are invalid',
        invalidIds,
      });
    }

    // Validate Method
    const validMethods = ['call', 'sms', 'app'];
    if (!Method || !validMethods.includes(Method)) {
      return res.status(400).json({
        message: 'Method must be one of: call, sms, app',
      });
    }

    const sos = await SOSLog.create({
      StudentId: req.user._id,
      AlertedTo,
      Method,
      TriggeredAt: new Date(),
    });

    res.status(201).json(sos);
  }),

  getAllApprovedCounselorPsychologist: asyncHandler(async (req, res) => {
    const counselorPsychologist = await CounselorPsychologist.find({
      Status: 'active',
      ApprovedByAdmin: true,
    }).select('_id FullName Specialization');
    res.status(200).json(counselorPsychologist);
  }),

  getMySOSLogs: asyncHandler(async (req, res) => {
    const soslogs = await SOSLog.find({ StudentId: req.user._id }).sort({
      TriggeredAt: -1,
    });

    if (!soslogs) {
      return res.status(404).json({ message: 'SOS not found' });
    }

    res.status(200).json(soslogs);
  }),

  deleteSOSLog: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid SOS Log ID' });
    }

    const deleted = await SOSLog.findOneAndDelete({
      _id: id,
      StudentId: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: 'SOS Log not found' });
    res.status(200).json({ message: 'SOS Log deleted' });
  }),

  // WELLNESS (MOOD)
  addMoodEntry: asyncHandler(async (req, res) => {
    const { Date: dateString, Mood, Note, Tags } = req.body;
    const validMoods = ['happy', 'sad', 'stressed', 'anxious', 'motivated'];
    const validTags = ['productive', 'positive', 'tired', 'focussed', 'lonely', 'social', 'bored', 'energetic'];

    if (!Mood) return res.status(400).json({ message: 'Mood is required' });

    if (!validMoods.includes(Mood)) {
      return res.status(400).json({ message: 'Invalid mood value' });
    }

    if (Tags && (!Array.isArray(Tags) || Tags.some(tag => !validTags.includes(tag)))) {
      return res.status(400).json({ message: 'Invalid tags provided' });
    }

    if (dateString && isNaN(Date.parse(dateString))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const moodEntry = {
      Date: dateString ? new Date(dateString) : new Date(),
      Mood,
      Note,
      Tags,
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user._id,
      { $push: { MoodEntries: moodEntry } },
      { new: true }
    );

    res.status(201).json(updatedStudent.MoodEntries);
  }),

  getMoodEntries: asyncHandler(async (req, res) => {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student.MoodEntries);
  }),

  updateMoodEntry: asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    const { Date, Mood, Note, Tags } = req.body;

    const validMoods = ['happy', 'sad', 'stressed', 'anxious', 'motivated'];
    const validTags = ['productive', 'positive', 'tired', 'focussed', 'lonely', 'social', 'bored', 'energetic'];

    if (isNaN(index))
      return res.status(400).json({ message: 'Invalid index' });

    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (index < 0 || index >= student.MoodEntries.length)
      return res.status(404).json({ message: 'Mood entry not found' });

    if (Date && isNaN(Date.parse(Date))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (Mood && !validMoods.includes(Mood)) {
      return res.status(400).json({ message: 'Invalid mood value' });
    }

    if (Tags && (!Array.isArray(Tags) || Tags.some(tag => !validTags.includes(tag)))) {
      return res.status(400).json({ message: 'Invalid tags provided' });
    }

    if (Date) student.MoodEntries[index].Date = new Date(Date);
    if (Mood) student.MoodEntries[index].Mood = Mood;
    if (Note) student.MoodEntries[index].Note = Note;
    if (Tags) student.MoodEntries[index].Tags = Tags;

    await student.save();
    res.status(200).json(student.MoodEntries[index]);
  }),

  deleteMoodEntry: asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index))
      return res.status(400).json({ message: 'Invalid index' });

    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (index < 0 || index >= student.MoodEntries.length)
      return res.status(404).json({ message: 'Mood entry not found' });

    student.MoodEntries.splice(index, 1);
    await student.save();

    res.status(200).json({ message: 'Mood entry deleted' });
  }),

  // WELLNESS (HABIT)
  addHabitLog: asyncHandler(async (req, res) => {
    const { Date, Exercise, Hydration, ScreenTime, SleepHours } = req.body;
    if (!Date || isNaN(Date.parse(Date))) {
      return res.status(400).json({ message: 'Valid Date is required' });
    }

    if (
      Hydration !== undefined && (typeof Hydration !== 'number' || Hydration < 0 || Hydration > 10000) ||
      ScreenTime !== undefined && (typeof ScreenTime !== 'number' || ScreenTime < 0 || ScreenTime > 24) ||
      SleepHours !== undefined && (typeof SleepHours !== 'number' || SleepHours < 0 || SleepHours > 24) ||
      Exercise !== undefined && typeof Exercise !== 'boolean'
    ) {
      return res.status(400).json({ message: 'Invalid values provided' });
    }

    const habitLog = {
      Date: new Date(Date),
      Exercise: Exercise ?? false,
      Hydration: Hydration ?? 0,
      ScreenTime: ScreenTime ?? 0,
      SleepHours: SleepHours ?? 0,
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user._id,
      { $push: { HabitLogs: habitLog } },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(201).json(updatedStudent.HabitLogs);
  }),

  getHabitLogs: asyncHandler(async (req, res) => {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student.HabitLogs);
  }),

  updateHabitLog: asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    const { Date: dateString, Exercise, Hydration, ScreenTime, SleepHours } = req.body;

    if (isNaN(index))
      return res.status(400).json({ message: 'Invalid index' });

    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (index < 0 || index >= student.HabitLogs.length) {
      return res.status(404).json({ message: 'Habit log not found' });
    }

    if (dateString && isNaN(Date.parse(dateString))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (
      Hydration !== undefined && (typeof Hydration !== 'number' || Hydration < 0 || Hydration > 10000) ||
      ScreenTime !== undefined && (typeof ScreenTime !== 'number' || ScreenTime < 0 || ScreenTime > 24) ||
      SleepHours !== undefined && (typeof SleepHours !== 'number' || SleepHours < 0 || SleepHours > 24) ||
      Exercise !== undefined && typeof Exercise !== 'boolean'
    ) {
      return res.status(400).json({ message: 'Invalid values provided' });
    }

    const log = student.HabitLogs[index];
    if (!log)
      return res.status(404).json({ message: 'Habit log not found' });
    if (dateString) log.Date = new Date(dateString);
    if (Exercise !== undefined) log.Exercise = Exercise;
    if (Hydration !== undefined) log.Hydration = Hydration;
    if (ScreenTime !== undefined) log.ScreenTime = ScreenTime;
    if (SleepHours !== undefined) log.SleepHours = SleepHours;

    await student.save();
    res.status(200).json(log);
  }),

  deleteHabitLog: asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index))
      return res.status(400).json({ message: 'Invalid index' });

    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (index < 0 || index >= student.HabitLogs.length) {
      return res.status(404).json({ message: 'Habit log not found' });
    }

    if (!student.HabitLogs[index])
      return res.status(404).json({ message: 'Habit log not found' });

    student.HabitLogs.splice(index, 1);
    await student.save();

    res.status(200).json({ message: 'Habit log deleted' });
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
    const { TargetId, Reason } = req.body;

    if (!TargetId || !Reason) {
      return res.status(400).json({ message: 'TargetId and Reason are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(TargetId)) {
      return res.status(400).json({ message: 'Invalid TargetId format' });
    }

    const validReasons = ['spam', 'abuse', 'offensive', 'harassment', 'misinformation'];
    if (!validReasons.includes(Reason)) {
      return res.status(400).json({ message: 'Invalid Reason value' });
    }

    const report = await Report.create({
      ReporterId: req.user._id,
      TargetId,
      Reason,
    });

    res.status(201).json(report);
  }),

  getMyReports: asyncHandler(async (req, res) => {
    const reports = await Report.find({ ReporterId: req.user._id })
      .sort({ createdAt: -1 }); // Show newest first

    if (!reports) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json(reports);
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

    // Ensure only the user who created the report can delete it
    if (!report.ReporterId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to delete this report' });
    }

    await report.deleteOne();
    res.status(200).json({ message: 'Report deleted successfully' });
  }),

};

module.exports = studentController;