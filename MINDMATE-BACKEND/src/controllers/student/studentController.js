const bcrypt = require('bcryptjs');
const asyncHandler = require('../../utils/asyncHandler');
const { generateToken } = require('../../config/jwt');

const Student = require('../../models/Student');
const Appointment = require('../../models/Appointment');
const Vent = require('../../models/VentWall');
const Feedback = require('../../models/Feedback');
const SOSLog = require('../../models/SOSLog');
const Resource = require('../../models/Resource');
const Reports = require('../../models/Report');

const studentController = {

  // AUTH
  signupStudent: asyncHandler(async (req, res) => {
    const { AliasId, password } = req.body;
    const existingStudent = await Student.findOne({ AliasId });
    if (existingStudent)
      return res.status(400).json({ message: 'Alias ID already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = await Student.create({
      AliasId,
      PasswordHash: hashedPassword,
    });

    const token = generateToken({ _id: newStudent._id, role: 'student' });
    res.status(201).json({ token, student: newStudent });
  }),

  loginStudent: asyncHandler(async (req, res) => {
    const { AliasId, password } = req.body;
    const student = await Student.findOne({ AliasId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isMatch = await bcrypt.compare(password, student.PasswordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ _id: student._id, role: 'student' });
    res.status(200).json({ token, student });
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

    const appointments = await Appointment.find({ StudentId: req.user._id }).select('-__v');
    res.status(200).json({
      ...profile.toObject(),
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

    const salt = await bcrypt.genSalt(10);
    student.PasswordHash = await bcrypt.hash(newPassword, salt);

    await student.save();

    res.status(200).json({ message: 'Password updated successfully' });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const updated = await Student.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    }).select('-PasswordHash');
    res.status(200).json(updated);
  }),

  // APPOINTMENTS
  createAppointment: asyncHandler(async (req, res) => {
    const { CounselorId, SlotDate, SlotStartTime, SlotEndTime } = req.body;
    const appointment = await Appointment.create({
      CounselorId,
      SlotDate,
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
    res.status(200).json(appointments);
  }),

  updateAppointment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
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

    const vent = await Vent.create({
      Topic,
      Content,
      StudentId: req.user._id,
      CreatedAt: new Date(),
      Likes: [],
      Reports: [],
    });

    res.status(201).json(vent);
  }),

  getMyVents: asyncHandler(async (req, res) => {
    const vents = await Vent.find({ StudentId: req.user._id }).sort({
      CreatedAt: -1,
    });
    res.status(200).json(vents);
  }),

  updateVent: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
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
    if (!Rating)
      return res.status(400).json({ message: 'Rating is required' });

    const feedback = await Feedback.create({
      StudentId: req.user._id,
      Rating,
      Comment,
      Type,
      CreatedAt: new Date(),
    });

    res.status(201).json(feedback);
  }),

  getMyFeedbacks: asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find({ StudentId: req.user._id }).sort({
      CreatedAt: -1,
    });
    res.status(200).json(feedbacks);
  }),

  updateFeedback: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
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

    const sos = await SOSLog.create({
      StudentId: req.user._id,
      AlertedTo,
      Method,
      TriggeredAt: new Date(),
    });

    res.status(201).json(sos);
  }),

  getMySOSLogs: asyncHandler(async (req, res) => {
    const soslogs = await SOSLog.find({ StudentId: req.user._id }).sort({
      TriggeredAt: -1,
    });
    res.status(200).json(soslogs);
  }),

  deleteSOSLog: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await SOSLog.findOneAndDelete({
      _id: id,
      StudentId: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: 'SOS Log not found' });
    res.status(200).json({ message: 'SOS Log deleted' });
  }),

};

module.exports = studentController;
