const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const makeCall = async (to) => {
    try {
        await client.calls.create({
            twiml: '<Response><Say>This is an emergency. A student has triggered an SOS on MindMate. Please check immediately.</Say></Response>',
            to,
            from: process.env.TWILIO_PHONE_NUMBER,
        });
        console.log(`📞 Call initiated to ${to}`);
    } catch (err) {
        console.error(`❌ Failed to call ${to}:`, err.message);
    }
};

module.exports = makeCall;