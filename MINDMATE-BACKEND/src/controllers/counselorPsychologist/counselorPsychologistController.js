const bcrypt = require('bcryptjs');
const asyncHandler = require('../../utils/asyncHandler');
const { generateToken } = require('../../config/jwt');

const sendEmail = require('../../utils/autoEmail')
const sendSMS = require('../../utils/sendSMS');

const CounselorPsychologist = require('../../models/CounselorPsychologist');
const Appointment = require('../../models/Appointment');
const Feedback = require('../../models/Feedback');
const SOSLog = require('../../models/SOSLog');
const Student = require('../../models/Student')

// Validation regex
const regex = {
    aliasId: /^[a-zA-Z0-9_]{4,20}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
    phone: /^\d{10}$/,
    email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
};

const CounselorPsychologistController = {

    // AUTH
    signupCounselorPsychologist: asyncHandler(async (req, res) => {
        const { AliasId, password, phone, email, fullName, role, specialization, credentials } = req.body;

        if (!AliasId || !password || !phone || !email || !fullName || !role || !specialization || !credentials)
            return res.status(400).json({ message: 'All fields are required' });

        if (!regex.aliasId.test(AliasId)) {
            return res.status(400).json({ message: 'Alias ID must be 4–20 characters, alphanumeric or underscore only' });
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

        const existingUser = await CounselorPsychologist.findOne({ AliasId });
        if (existingUser)
            return res.status(400).json({ message: 'Alias ID already exists' });

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
            AliasId,
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

    loginCounselorPsychologist: asyncHandler(async (req, res) => {
        const { AliasId, password } = req.body;
        if (!AliasId || !password) {
            return res.status(400).json({ message: 'Alias ID and password are required' });
        }

        const user = await CounselorPsychologist.findOne({ AliasId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.ApprovedByAdmin) {
            return res.status(403).json({ message: 'Your account is pending admin approval.' });
        };

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
            return res.status(200).json({ token, user });
        }
    }),

    forgotAliasIdByPhone: asyncHandler(async (req, res) => {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        const user = await CounselorPsychologist.findOne({ Phone: phone });
        if (!user)
            return res.status(404).json({ message: 'No account found for this phone number' });

        sendSMS(phone, `Your Alias ID is: ${user.AliasId}`);
        if (user.Email) {
            await sendEmail({
                to: user.Email,
                subject: 'MindMate - Alias ID',
                html: `<p>Hello,</p><p>Your Alias ID is: <strong>${user.AliasId}</strong></p>`,
            });
        }

        res.status(200).json({ message: 'Alias ID sent to your registered phone and email' });
    }),

    forgotPasswordByPhone: asyncHandler(async (req, res) => {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        const user = await CounselorPsychologist.findOne({ Phone: phone });
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
        }

        res.status(200).json({ message: 'Temporary password sent to your registered phone and email.' });
    }),

    setNewPassword: asyncHandler(async (req, res) => {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            return res.status(400).json({ message: 'User ID and new password required' });
        }

        if (!regex.password.test(newPassword)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long and contain at least one letter and one number',
            });
        }

        const user = await CounselorPsychologist.findById(userId);
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
        const user = await CounselorPsychologist.findById(req.user._id).select('-PasswordHash -tempPasswordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    }),

    updateProfile: asyncHandler(async (req, res) => {
        const allowedFields = ['Phone', 'Email', 'FullName', 'Credentials', 'Specialization'];
        const updates = req.body;

        const isValid = Object.keys(updates).every(field => allowedFields.includes(field));
        if (!isValid) return res.status(400).json({ message: 'Invalid fields in update' });

        if (updates.Phone && !regex.phone.test(updates.Phone)) {
            return res.status(400).json({ message: 'Phone must be a valid phone number' });
        };
        if (updates.Email && !regex.email.test(updates.Email)) {
            return res.status(400).json({ message: 'Email format is invalid' });
        };

        const updated = await CounselorPsychologist.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-PasswordHash');
        res.status(200).json(updated);
    }),

    changePassword: asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new passwords are required' });
        };

        const user = await CounselorPsychologist.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);
        if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });

        if (!regex.password.test(newPassword)) {
            return res.status(400).json({
                message: 'New password must be at least 6 characters long and include at least one letter and one number',
            });
        };

        const isSameAsOld = await bcrypt.compare(newPassword, user.PasswordHash);
        if (isSameAsOld) {
            return res.status(400).json({ message: 'New password must be different from the old one' });
        };

        user.PasswordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    }),

    // APPOINTMENTS
    getAppointments: asyncHandler(async (req, res) => {
        const appointments = await Appointment.find({ CounselorPsychologistId: req.user._id })
            .populate('StudentId', 'AliasId')
            .sort({ SlotDate: -1 });

        res.status(200).json(appointments);
    }),

    updateAppointmentStatus: asyncHandler(async (req, res) => {
        const { appointmentId } = req.params;
        const userId = req.user._id;
        const { status } = req.body;

        const allowedStatuses = ['confirmed', 'rejected', 'completed'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment || appointment.CounselorPsychologistId.toString() !== userId) {
            return res.status(404).json({ message: 'Appointment not found or access denied' });
        }

        appointment.Status = status;
        await appointment.save();

        res.status(200).json({ message: 'Appointment status updated' });
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
            .populate('StudentId', 'AliasId')
            .populate({
                path: 'AppointmentId',
                match: { CounselorPsychologistId: counselorPsychologistId },
            })
            .sort({ CreatedAt: -1 });

        const filtered = feedbacks.filter(fb => fb.AppointmentId !== null);

        res.status(200).json(filtered);
    }),

    // SOS LOGS
    getSOSLogs: asyncHandler(async (req, res) => {
        const logs = await SOSLog.find({ AlertedTo: req.user._id })
            .populate('StudentId', 'AliasId')
            .sort({ TriggeredAt: -1 });

        res.status(200).json(logs);
    }),

    respondSOS: asyncHandler(async (req, res) => {
        const { logId } = req.params;
        const sos = await SOSLog.findById(logId);

        if (!sos || !sos.AlertedTo.includes(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized to respond' });
        };

        // Prevent duplicate responses
        if (sos.Status === 'responded') {
            return res.status(400).json({ message: 'SOS already responded' });
        };

        sos.RespondedAt = Date.now();
        sos.Status = 'responded';
        await sos.save();

        res.status(200).json({ message: 'SOS responded successfully' });
    }),

    // WELLNESS
    getWellness: asyncHandler(async (req, res) => {
        const counselorPsychologistId = req.user._id;

        const appointments = await Appointment.find({ CounselorPsychologistId: counselorPsychologistId }, 'StudentId');

        const studentIds = [...new Set(appointments.map(app => app.StudentId.toString()))];

        const students = await Student.find(
            { _id: { $in: studentIds } },
            {
                AliasId: 1,
                MoodEntries: 1,
                HabitLogs: 1,
                createdAt: 1
            }
        ).sort({ createdAt: -1 });

        res.json(students);
    }),

    getStudentInfo: asyncHandler(async (req, res) => {
        const student = await Student.findById(req.params.id).select('AliasId');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    }),

    getMyStudents: asyncHandler(async (req, res) => {
        const counselorPsychologistId = req.user._id;

        const appointments = await Appointment.find({ CounselorPsychologistId: counselorPsychologistId })
            .populate('StudentId', 'AliasId')
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

};

module.exports = CounselorPsychologistController;