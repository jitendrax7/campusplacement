




export const sendApplicationSuccessEmail = (username, jobTitle, companyName) => {
  return {
    subject: "Application Submitted Successfully – Campus Placement",
    text: `Hi ${username},

Your application for the position "${jobTitle}" at ${companyName} has been submitted successfully ✅.

We’ll update you as soon as possible when the recruiter reviews your application.  
Meanwhile, you can track the status of your application anytime from your dashboard.

Stay positive, and best of luck with your application! 🚀

Cheers,  
The Campus Placement Team`,
    html: `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Application Successful</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .bg { background: #1a202c !important; }
      .card { background: #2d3748 !important; border-color:#4a5568 !important; }
      .text { color: #edf2f7 !important; }
      .muted { color: #a0aec0 !important; }
      .brand { color: #48bb78 !important; }
      .btn { background:#3182ce !important; color:#ffffff !important; }
    }

    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .h1 { font-size: 22px !important; }
    }
  </style>
</head>
<body class="bg" style="margin:0;padding:0;background:#f5f7fb;">

  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;">
    <tr>
      <td align="center" style="padding:24px;">
        <table class="container" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 12px 0 20px;">
              <div class="brand" style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#2b6cb0;">
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
                      Application Submitted 🎉
                    </h1>
                    <p class="text" style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#4a5568;">
                      Hi <strong>${username}</strong>, your application for 
                      <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:8px 28px 0;">
                    <p class="text" style="font-family:Arial,sans-serif;font-size:14px;color:#4a5568;">
                      We’ll update you as soon as possible when the recruiter reviews your application.  
                      Meanwhile, you can check the status anytime in your dashboard.
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding: 20px 28px;">
                    <a href="https://jobportal.com/dashboard" class="btn" style="background:#3182ce;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;">
                      View My Applications
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 28px 24px;">
                    <p class="muted" style="font-family:Arial,sans-serif;font-size:12px;color:#718096;">
                      If you did not apply for this position, please ignore this email or contact support.
                      <br><br>
                      Wishing you the best of luck,<br>
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




export const applicationStatusEmail = (userName, jobTitle, companyName, status) => {
  let subject = "";
  let heading = "";
  let message = "";
  let extraNote = "";

  switch (status) {
    case "Applied":
      subject = `Application Received - ${jobTitle} at ${companyName}`;
      heading = "Your Application Has Been Received!";
      message = `
        We are excited to let you know that your application for the <b>${jobTitle}</b> position at <b>${companyName}</b> has been successfully submitted on <b>CampusConnect</b>. 
        <br/><br/>
        Our recruitment team has started the initial screening process. Your profile will be carefully reviewed to determine the best fit for the role.
      `;
      extraNote = `
        You can log in to your CampusConnect account anytime to track the progress of your application in real-time. 
        <br/><br/>
        Stay tuned – we will keep you updated at every stage of the process.
      `;
      break;

    case "Under Review":
      subject = `Application Under Review - ${jobTitle}`;
      heading = "Your Application is Under Review";
      message = `
        Good news! Your application for the <b>${jobTitle}</b> position at <b>${companyName}</b> is currently being reviewed by the hiring team. 
        <br/><br/>
        They are carefully evaluating your qualifications, skills, and experiences to determine the next steps.
      `;
      extraNote = `
        This process may take a few days depending on the number of applicants. 
        <br/><br/>
        You can always track the status of your application through your CampusConnect dashboard.
      `;
      break;

    case "Interview":
      subject = `Interview Invitation - ${jobTitle}`;
      heading = "You’ve Been Shortlisted for an Interview!";
      message = `
        Congratulations ${userName || ""}! 🎉 
        <br/><br/>
        Your application for the <b>${jobTitle}</b> role at <b>${companyName}</b> has been shortlisted, and you are now invited for the next stage of the recruitment process – the interview.
      `;
      extraNote = `
        Our recruitment team will share the interview schedule, mode (online/offline), and further instructions with you soon. 
        <br/><br/>
        Please ensure you are prepared and check your CampusConnect account and registered email regularly for updates.
      `;
      break;

    case "Selected":
      subject = `Congratulations! You’re Selected - ${jobTitle}`;
      heading = "You’re Selected!";
      message = `
        We are delighted to inform you that after a thorough evaluation, you have been <b>selected</b> for the <b>${jobTitle}</b> role at <b>${companyName}</b>. 🎉
        <br/><br/>
        Your skills, passion, and performance throughout the process have truly impressed the recruiters.
      `;
      extraNote = `
        The HR team will soon reach out to you with details regarding the next steps, such as offer letter, onboarding, and joining formalities. 
        <br/><br/>
        You can also view your selection status and upcoming actions by logging in to your CampusConnect account.
      `;
      break;

    case "Rejected":
      subject = `Application Update - ${jobTitle}`;
      heading = "Update on Your Application";
      message = `
        Thank you for applying for the <b>${jobTitle}</b> role at <b>${companyName}</b> through <b>CampusConnect</b>. 
        <br/><br/>
        After careful review of your application, we regret to inform you that you were not shortlisted for this role at this time.
      `;
      extraNote = `
        Please do not be discouraged – competition for roles is always strong, and this decision does not reflect your overall abilities or potential. 
        <br/><br/>
        We encourage you to keep exploring and applying to other opportunities available on CampusConnect. Your right opportunity may be just around the corner.
      `;
      break;

    default:
      subject = `Application Update - ${jobTitle}`;
      heading = "Application Status Update";
      message = `
        Your application status for the <b>${jobTitle}</b> role at <b>${companyName}</b> has been updated to: <b>${status}</b>. 
        <br/><br/>
        Please log in to CampusConnect for more details.
      `;
      extraNote = `
        We’ll continue to keep you informed as things progress.
      `;
      break;
  }

  return {
    subject,
    text: `Hello ${userName || ""},

${heading}

${message.replace(/<[^>]+>/g, "")}

${extraNote.replace(/<[^>]+>/g, "")}

Thank you,
CampusConnect Team`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
          <h2 style="text-align: center; color: #2c3e50;">${heading}</h2>
          <p>Hi ${userName || ""},</p>
          <p style="font-size: 15px; color: #333;">${message}</p>
          <p style="font-size: 15px; color: #333;">${extraNote}</p>
          <div style="margin-top: 20px; padding: 15px; background: #eef6ff; border-left: 4px solid #3498db;">
              <p style="margin: 0; color: #3498db;"><b>CampusConnect – Empowering Students, Connecting Opportunities</b></p>
          </div>
          <p style="margin-top: 20px; font-size: 13px; color: #555;">
              This is an automated message from CampusConnect. Please do not reply directly to this email.
          </p>
      </div>
    `
  };
};
