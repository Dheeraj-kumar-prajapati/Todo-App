const nodemailer = require('nodemailer');

function generateOTP() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return randomNum.toString();
}

async function sendOTP(email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "061black6devil@gmail.com",
            pass: "wfjkxybiqgmbgtjr"
        }
    })

    const OTP = generateOTP();
    console.log("otp : ", OTP);
    const mailOptionn = {
        from: "061black6devil@gmail.com",
        to: email,
        subject: "For Account Verification",
        text: `OTP is : ${OTP} do not share these otp`
    }

    try {
        const result = await transporter.sendMail(mailOptionn);
        console.log("successfuly");
        return OTP;
    } catch (err) {
        console.log(err);
    }

}

module.exports = { sendOTP };