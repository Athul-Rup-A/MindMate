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

};

module.exports = studentController;
