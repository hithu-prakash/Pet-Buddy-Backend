const nodemailer = require("nodemailer")
const sendMail = (email, htmlMsg, subject) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD
        }
    });

    async function mailSend() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: htmlMsg, // html body
        });
    }
    mailSend().catch(console.error)
}

module.exports = sendMail 