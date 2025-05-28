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

  // WELLNESS (MOOD)
  addMoodEntry: asyncHandler(async (req, res) => {
    const { Date, Mood, Note, Tags } = req.body;
    if (!Mood) return res.status(400).json({ message: 'Mood is required' });

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user._id,
      { $push: { MoodEntries: { Date, Mood, Note, Tags } } },
      { new: true }
    );

    res.status(201).json(updatedStudent.MoodEntries);
  }),

  getMoodEntries: asyncHandler(async (req, res) => {
    const student = await Student.findById(req.user._id);
    res.status(200).json(student.MoodEntries);
  }),

  updateMoodEntry: asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    const { Date, Mood, Note, Tags } = req.body;
    if (isNaN(index))
      return res.status(400).json({ message: 'Invalid index' });

    const student = await Student.findById(req.user._id);
    if (!student.MoodEntries[index])
      return res.status(404).json({ message: 'Mood entry not found' });

    if (Date) student.MoodEntries[index].Date = Date;
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
    if (!student.MoodEntries[index])
      return res.status(404).json({ message: 'Mood entry not found' });

    student.MoodEntries.splice(index, 1);
    await student.save();

    res.status(200).json({ message: 'Mood entry deleted' });
  }),

  // WELLNESS (HABIT)
  addHabitLog: asyncHandler(async (req, res) => {
    const { Date, Exercise, Hydration, ScreenTime, SleepHours } = req.body;
    if (!Date) return res.status(400).json({ message: 'Date is required' });

    const habitLog = { Date, Exercise, Hydration, ScreenTime, SleepHours };

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user._id,
      { $push: { HabitLogs: habitLog } },
      { new: true }
    );

    res.status(201).json(updatedStudent.HabitLogs);
  }),

  getHabitLogs: asyncHandler(async (req, res) => {
    const student = await Student.findById(req.user._id);
    res.status(200).json(student.HabitLogs);
  }),

  updateHabitLog: asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    const { Date, Exercise, Hydration, ScreenTime, SleepHours } = req.body;
    if (isNaN(index))
      return res.status(400).json({ message: 'Invalid index' });

    const student = await Student.findById(req.user._id);
    if (!student.HabitLogs[index])
      return res.status(404).json({ message: 'Habit log not found' });

    if (Date) student.HabitLogs[index].Date = Date;
    if (Exercise) student.HabitLogs[index].Exercise = Exercise;
    if (Hydration) student.HabitLogs[index].Hydration = Hydration;
    if (ScreenTime) student.HabitLogs[index].ScreenTime = ScreenTime;
    if (SleepHours) student.HabitLogs[index].SleepHours = SleepHours;

    await student.save();
    res.status(200).json(student.HabitLogs[index]);
  }),

  deleteHabitLog: asyncHandler(async (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index))
      return res.status(400).json({ message: 'Invalid index' });

    const student = await Student.findById(req.user._id);
    if (!student.HabitLogs[index])
      return res.status(404).json({ message: 'Habit log not found' });

    student.HabitLogs.splice(index, 1);
    await student.save();

    res.status(200).json({ message: 'Habit log deleted' });
  }),

  // RESOURCES (VIEW ONLY)
  getResources: asyncHandler(async (req, res) => {
    const resources = await Resource.find();
    res.status(200).json(resources);
  }),

  getResourceById: asyncHandler(async (req, res) => {
    const { id } = req.params;
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
    res.status(200).json(reports);
  }),

  deleteReport: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Optional: Ensure only the user who created the report can delete it
    if (!report.ReporterId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to delete this report' });
    }

    await report.deleteOne();
    res.status(200).json({ message: 'Report deleted successfully' });
  }),

};

module.exports = studentController;
