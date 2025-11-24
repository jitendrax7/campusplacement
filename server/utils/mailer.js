import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

    await transporter.sendMail({
    from: '"campusconnect" <no-reply@campusconnect.com>',
    to,
    subject,
    text,
    html,
  });

}; 
 