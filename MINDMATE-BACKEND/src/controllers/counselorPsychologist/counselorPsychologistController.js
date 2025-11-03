const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('../../utils/asyncHandler');
const { generateToken } = require('../../config/jwt');

const sendEmail = require('../../utils/autoEmail')

const CounselorPsychologist = require('../../models/CounselorPsychologist');
const Appointment = require('../../models/Appointment');
const Feedback = require('../../models/Feedback');
const Student = require('../../models/Student')
const Report = require('../../models/Report')

// Validation regex
const regex = {
    username: /^[a-zA-Z0-9_]{4,20}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
    phone: /^\d{10}$/,
    email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
};

const CounselorPsychologistController = {

    // AUTH
    signupCounselorPsychologist: asyncHandler(async (req, res) => {
        const { Username, password, phone, email, fullName, role, specialization, credentials } = req.body;

        if (!Username || !password || !phone || !email || !fullName || !role || !specialization || !credentials)
            return res.status(400).json({ message: 'All fields are required' });

        if (!regex.username.test(Username)) {
            return res.status(400).json({ message: 'Username must be 4–20 characters, alphanumeric or underscore only' });
        }

        if (!regex.password.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long and contain at least one letter and one number',
            });
        }

        if (!regex.phone.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }

        if (!regex.email.test(req.body.email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!['counselor', 'psychologist'].includes(role))
            return res.status(400).json({ message: 'Invalid role' });

        const existingUser = await CounselorPsychologist.findOne({ Username });
        if (existingUser)
            return res.status(400).json({ message: 'Username already exists' });

        const existingPhone = await CounselorPsychologist.findOne({ Phone: phone });
        if (existingPhone) {
            return res.status(409).json({ message: 'Phone number is already registered' });
        }

        const existingEmail = await CounselorPsychologist.findOne({ Email: email });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await CounselorPsychologist.create({
            Username,
            PasswordHash: hashedPassword,
            Phone: phone,
            Email: email,
            FullName: fullName,
            Role: role,
            Credentials: credentials,
            Specialization: specialization,
            ApprovedByAdmin: false,
            Status: 'pending',
        });

        const token = generateToken({ _id: newUser._id, role });
        res.status(201).json({ token, user: newUser });
    }),

    // PROFILE
    getProfile: asyncHandler(async (req, res) => {
        const user = await CounselorPsychologist.findById(req.user._id).select('-PasswordHash -tempPasswordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    }),

    updateProfileImage: asyncHandler(async (req, res) => {
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const fullImageUrl = `${baseUrl}/uploads/profile-images/${req.file.filename}`;

        const updatedUser = await CounselorPsychologist.findByIdAndUpdate(
            userId,
            { ProfileImage: fullImageUrl },
            { new: true }
        ).select('-PasswordHash');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            ProfileImage: fullImageUrl,
        });
    }),

    updateProfileRequest: asyncHandler(async (req, res) => {
        const allowedFields = ['Phone', 'Email', 'FullName', 'Credentials', 'Specialization'];
        const updates = req.body;

        const isValid = Object.keys(updates).every(field => allowedFields.includes(field));
        if (!isValid) return res.status(400).json({ message: 'Invalid fields in update' });

        const user = await CounselorPsychologist.findById(req.user._id);

        if (updates.Password) {
            updates.PasswordHash = await bcrypt.hash(updates.Password, 10);
            delete updates.Password;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

        user.pendingUpdates = { ...updates, token, expiresAt };
        await user.save();

        const verifyLink = `${process.env.FRONTEND_URL}/counselorpsychologist/verify-profile-update/${token}`;
        await sendEmail({
            to: 'edk934@gmail.com',
            subject: 'Verify Your Profile Update',
            html: `
    <p>Click <a href="${verifyLink}">here</a> to verify your profile update.</p>
    <p>If you didn't change it, someone else might be using your account. Please change your password immediately.</p>
  `,
        });

        res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
    }),

    verifyProfileUpdate: asyncHandler(async (req, res) => {
        const { token } = req.params;

        const user = await CounselorPsychologist.findOne({ 'pendingUpdates.token': token });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        if (user.pendingUpdates.expiresAt < new Date()) {
            user.pendingUpdates = undefined;
            await user.save();
            return res.status(400).json({ message: 'Token expired' });
        }

        const { Phone, Email, FullName, Credentials, Specialization, PasswordHash } = user.pendingUpdates;

        if (Phone) user.Phone = Phone;
        if (Email) user.Email = Email;
        if (FullName) user.FullName = FullName;
        if (Credentials) user.Credentials = Credentials;
        if (Specialization) user.Specialization = Specialization;
        if (PasswordHash) user.PasswordHash = PasswordHash;

        user.pendingUpdates = undefined;
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user, });
    }),

    requestPasswordChange: asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new passwords are required' });
        }

        const user = await CounselorPsychologist.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);
        if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });

        if (!regex.password.test(newPassword)) {
            return res.status(400).json({
                message: 'New password must be at least 6 characters long and include at least one letter and one number',
            });
        }

        const isSameAsOld = await bcrypt.compare(newPassword, user.PasswordHash);
        if (isSameAsOld) {
            return res.status(400).json({ message: 'New password must be different from the old one' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

        user.pendingPasswordChange = {
            newPasswordHash: hashedNewPassword,
            token,
            expiresAt
        };
        await user.save();

        const verifyLink = `${process.env.FRONTEND_URL}/counselorpsychologist/verify-password-change/${token}`;
        await sendEmail({
            to: user.Email,
            subject: 'MindMate - Confirm Password Change',
            html: `<p>Click <a href="${verifyLink}">here</a> to confirm your password change.</p>
               <p>This link expires in 30 minutes.</p>
               <p>If you didn't change it, someone else might be using your account. Please change your password immediately.</p>`
        });

        res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
    }),

    verifyPasswordChange: asyncHandler(async (req, res) => {
        const { token } = req.params;

        const user = await CounselorPsychologist.findOne({ 'pendingPasswordChange.token': token });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        if (user.pendingPasswordChange.expiresAt < new Date()) {
            user.pendingPasswordChange = undefined;
            await user.save();
            return res.status(400).json({ message: 'Token expired' });
        }

        user.PasswordHash = user.pendingPasswordChange.newPasswordHash;
        user.pendingPasswordChange = undefined;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully. Please log in again.' });
    }),

    // APPOINTMENTS
    getAppointments: asyncHandler(async (req, res) => {
        const appointments = await Appointment.find({ CounselorPsychologistId: req.user._id })
            .populate('StudentId', 'Username')
            .sort({ SlotDate: -1 });

        res.status(200).json(appointments);
    }),

    updateAppointmentStatus: asyncHandler(async (req, res) => {
        const { appointmentId } = req.params;
        const userId = req.user._id;
        const { status, reason } = req.body;

        const allowedStatuses = ['confirmed', 'rejected', 'completed'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        if (status === 'rejected' && (!reason || reason.trim().length < 3)) {
            return res.status(400).json({ message: 'Please provide a reason for rejecting the appointment.' });
        }

        const appointment = await Appointment.findById(appointmentId).populate('StudentId', 'Email Username');
        if (!appointment || appointment.CounselorPsychologistId.toString() !== userId) {
            return res.status(404).json({ message: 'Appointment not found or access denied' });
        }

        appointment.Status = status;
        if (status === 'rejected') {
            appointment.StatusReason = reason;
        }

        await appointment.save();

        if (appointment.StudentId?.Email && (status === 'confirmed' || status === 'rejected')) {
            try {
                await sendEmail({
                    to: appointment.StudentId.Email,
                    subject: `Your appointment has been ${status}`,
                    html: `
          <h3>Appointment Update</h3>
          <p>Dear ${appointment.StudentId.Username},</p>
          <p>Your appointment scheduled on <b>${appointment.SlotDate.toDateString()}</b> from <b>${appointment.SlotStartTime}</b> to <b>${appointment.SlotEndTime}</b> has been <b>${status}</b>.</p>
          ${status === 'rejected' ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Regards,<br/>MindMate Support Team</p>
        `
                });
            } catch (err) {
                console.error('Email not sent:', err.message);
            }
        }

        res.status(200).json({ message: 'Appointment status updated', appointment });
    }),

    // AVAILABILITY
    getAvailability: asyncHandler(async (req, res) => {
        const user = await CounselorPsychologist.findById(req.user._id).select('AvailabilitySlots');

        if (!user) {
            return res.status(404).json({ message: 'AvailabilitySlots not found' });
        };

        res.status(200).json(user.AvailabilitySlots);
    }),

    updateAvailability: asyncHandler(async (req, res) => {
        const { AvailabilitySlots } = req.body;

        if (!Array.isArray(AvailabilitySlots)) {
            return res.status(400).json({ message: 'Availability must be an array' });
        };

        // Check for each slot has Day, StartTime, EndTime
        if (!AvailabilitySlots.every(s => s.Day && s.StartTime && s.EndTime)) {
            return res.status(400).json({ message: 'Each slot must have Day, StartTime, and EndTime' });
        };

        const user = await CounselorPsychologist.findByIdAndUpdate(req.user._id, { AvailabilitySlots }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'AvailabilitySlots not found' });
        };

        res.status(200).json(user.AvailabilitySlots);
    }),

    // FEEDBACKS
    getFeedbacks: asyncHandler(async (req, res) => {
        const counselorPsychologistId = req.user._id;

        const feedbacks = await Feedback.find({ StudentId: { $exists: true }, Type: 'session' })
            .populate('StudentId', 'Username')
            .populate({
                path: 'AppointmentId',
                match: { CounselorPsychologistId: counselorPsychologistId },
            })
            .sort({ CreatedAt: -1 });

        const filtered = feedbacks.filter(fb => fb.AppointmentId !== null);

        res.status(200).json(filtered);
    }),

    getStudentInfo: asyncHandler(async (req, res) => {
        const student = await Student.findById(req.params.id).select('Username');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    }),

    getMyStudents: asyncHandler(async (req, res) => {
        const counselorPsychologistId = req.user._id;

        const appointments = await Appointment.find({ CounselorPsychologistId: counselorPsychologistId })
            .populate('StudentId', 'Username Status createdAt')
            .lean();

        const seen = new Set();
        const uniqueStudents = [];

        for (const appt of appointments) {
            const student = appt.StudentId;
            if (student && !seen.has(student._id.toString())) {
                seen.add(student._id.toString());
                uniqueStudents.push(student);
            }
        }
        res.status(200).json(uniqueStudents);
    }),

    getStats: asyncHandler(async (req, res) => {
        const counselorId = req.user._id;

        const totalAppointments = await Appointment.countDocuments({ CounselorPsychologistId: counselorId });
        const totalStudents = await Appointment.distinct("StudentId", { CounselorPsychologistId: counselorId }).then(ids => ids.length);
        const totalFeedbacks = await Feedback.countDocuments({ CounselorPsychologistId: counselorId });
        const totalReports = await Report.countDocuments({ TargetId: counselorId });

        res.status(200).json({ totalAppointments, totalStudents, totalFeedbacks, totalReports });
    }),

};

module.exports = CounselorPsychologistController;