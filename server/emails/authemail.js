

export const otpVerificationEmail = (userName, otp) => {
  return {
    subject: "Verify Your Email - OTP Verification",
    text: `Hello ${userName || ""},
    
Your One-Time Password (OTP) for verifying your email is: ${otp}

This OTP is valid for the next 5 minutes.
If you did not request this, please ignore this email.

Thank you,
Campus Placement Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="text-align: center; color: #333;">Verify Your Email</h2>
          <p>Hi ${userName || ""},</p>
          <p>Your One-Time Password (OTP) for verifying your email is:</p>
          <h1 style="text-align: center; background: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>. Please do not share it with anyone.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p style="margin-top: 20px;">Best Regards,<br><b>Campus Placement Team</b></p>
      </div>
    `
  };
};






export const sendStudentSuccessEmail = ( username) => {
  return {
   
    subject: "Welcome to Campus Placement – Registration Successful!",
    text: `Hi ${username},

Your registration was successful.
Welcome to Campus Placement! You can now explore internships, apply for jobs, and connect with recruiters.

Thank you,
The Campus Placement Team`,
    html: `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Registration Successful</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .bg { background: #1a202c !important; }
      .card { background: #2d3748 !important; border-color:#4a5568 !important; }
      .text { color: #edf2f7 !important; }
      .muted { color: #a0aec0 !important; }
      .brand { color: #48bb78 !important; }
      .btn { background:#38a169 !important; color:#ffffff !important; }
    }

    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .h1 { font-size: 22px !important; }
    }
  </style>
</head>
<body class="bg" style="margin:0;padding:0;background:#f5f7fb;">

  <div style="display:none;opacity:0;color:transparent;visibility:hidden;height:0;width:0;overflow:hidden;">
    Welcome to Campus Placement! You're all set to apply for jobs and internships.
  </div>

  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;">
    <tr>
      <td align="center" style="padding:24px;">
        <table class="container" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;background:transparent;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 12px 0 20px;">
              <div class="brand" style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#38a169;">
                Campus Placement
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table class="card" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:28px 28px 8px;">
                    <h1 class="h1 text" style="font-family:Arial,sans-serif;font-size:24px;margin:0;color:#2d3748;">
                      Welcome to Campus Placement, ${username}!
                    </h1>
                    <p class="text" style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#4a5568;">
                      Your account has been <strong>successfully registered</strong>. You can now browse internships, apply for jobs, and connect with recruiters 🚀
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 28px 0;">
                    <p class="text" style="font-family:Arial,sans-serif;font-size:14px;color:#4a5568;">
                      Start your journey by exploring the latest opportunities waiting for you.
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding: 20px 28px;">
                    <a href="https://jobportal.com/internships" class="btn" style="background:#38a169;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;">
                      Find Internships
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 28px 24px;">
                    <p class="muted" style="font-family:Arial,sans-serif;font-size:12px;color:#718096;">
                      If you did not create this account, please ignore this email or contact support.
                      <br><br>
                      Cheers,<br>
                      The Campus Placement Team
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:16px 0 0;">
              <p class="muted" style="font-family:Arial,sans-serif;font-size:12px;color:#a0aec0;">
                © ${new Date().getFullYear()} Campus Placement. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };
};





export const sendRecruiterSuccessEmail = (username, organization) => {
  return {
    subject: "Welcome to Campus Placement – Recruiter Registration Successful!",
    text: `Hi ${username},

Your recruiter account has been successfully created for ${organization}.
You can now post jobs, manage applications, and connect with talented students 🚀

Thank you,
The Campus Placement Team`,

    html: `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recruiter Registration Successful</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .bg { background: #1a202c !important; }
      .card { background: #2d3748 !important; border-color:#4a5568 !important; }
      .text { color: #edf2f7 !important; }
      .muted { color: #a0aec0 !important; }
      .brand { color: #3182ce !important; }
      .btn { background:#3182ce !important; color:#ffffff !important; }
    }

    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .h1 { font-size: 22px !important; }
    }
  </style>
</head>
<body class="bg" style="margin:0;padding:0;background:#f5f7fb;">

  <div style="display:none;opacity:0;color:transparent;visibility:hidden;height:0;width:0;overflow:hidden;">
    Welcome to Campus Placement! You’re all set to hire talented students.
  </div>

  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;">
    <tr>
      <td align="center" style="padding:24px;">
        <table class="container" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;background:transparent;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 12px 0 20px;">
              <div class="brand" style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#3182ce;">
                Campus Placement
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table class="card" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:28px 28px 8px;">
                    <h1 class="h1 text" style="font-family:Arial,sans-serif;font-size:24px;margin:0;color:#2d3748;">
                      Welcome aboard, ${username}!
                    </h1>
                    <p class="text" style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#4a5568;">
                      Your recruiter account for <strong>${organization}</strong> has been <strong>successfully registered</strong>.  
                      You can now <strong>post jobs, review applications, and hire top talent</strong>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 28px 0;">
                    <p class="text" style="font-family:Arial,sans-serif;font-size:14px;color:#4a5568;">
                      Start by creating your first job posting and discover the best candidates for your organization.
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding: 20px 28px;">
                    <a href="https://jobportal.com/recruiter/dashboard" class="btn" style="background:#3182ce;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 28px 24px;">
                    <p class="muted" style="font-family:Arial,sans-serif;font-size:12px;color:#718096;">
                      If you did not register this recruiter account, please contact our support team immediately.
                      <br><br>
                      Cheers,<br>
                      The Campus Placement Team
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:16px 0 0;">
              <p class="muted" style="font-family:Arial,sans-serif;font-size:12px;color:#a0aec0;">
                © ${new Date().getFullYear()} Campus Placement. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };
};
