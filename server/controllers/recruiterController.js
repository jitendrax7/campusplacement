import {v2 as cloudinary} from "cloudinary"
import db from "../config/db/db.js";
import { applicationStatusEmail } from "../emails/studentmail.js";
import { sendEmail } from "../utils/mailer.js";

// import { uploadToCloudinary } from "../utils/uploadBuffer.js";


export const getRecruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.user.id; 
    // const recruiterId = 3; // recruiter logged in

 
    const [[totalApplications]] = await db.query(
      `SELECT COUNT(a.id) AS total_applications
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = ?`,
      [recruiterId]
    );

 
    const [[activeJobs]] = await db.query(
      `SELECT COUNT(*) AS active_jobs
       FROM jobs 
       WHERE recruiter_id = ? AND deadline >= CURDATE()`,
      [recruiterId]
    );

    const [[scheduledInterviews]] = await db.query(
      `SELECT COUNT(a.id) AS scheduled_interviews
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = ? AND a.status = 'Interview'`,
      [recruiterId]
    );

   
    const [[hiredCandidates]] = await db.query(
      `SELECT COUNT(a.id) AS hired_candidates
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = ? AND a.status = 'Selected'`,
      [recruiterId]
    );


    res.json({
      success: true,
      stats: {
        totalApplications: totalApplications.total_applications || 0,
        activeJobs: activeJobs.active_jobs || 0,
        scheduledInterviews: scheduledInterviews.scheduled_interviews || 0,
        hiredCandidates: hiredCandidates.hired_candidates || 0,
      },
    });

    console.log({stats: {
        totalApplications: totalApplications.total_applications || 0,
        activeJobs: activeJobs.active_jobs || 0,
        scheduledInterviews: scheduledInterviews.scheduled_interviews || 0,
        hiredCandidates: hiredCandidates.hired_candidates || 0,
      }});
    
  } catch (error) {
    console.error("Error fetching recruiter dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};







export const getjobpost = async (req, res) => {
  
     try {
         
        // const id = 7;
        const id = req.user.id;

        const [jobs] = await db.query(`
    SELECT 
        j.job_role,
        j.id,
        j.title AS job_title,
        j.job_type,
        j.status,
        j.location,
        j.image_url,
        j.salary,
        j.stipend,
        j.duration,
        j.deadline,
        j.posted_at,
        (
            SELECT COUNT(*)
            FROM applications a
            WHERE a.job_id = j.id
        ) AS applicants
    FROM jobs j
    WHERE j.recruiter_id = ?
    ORDER BY j.posted_at DESC
    LIMIT 10;
`, [id]);
        
            // console.log(jobs)

            // console.log(jobs[0].applicants);
            

            if(jobs.length ===0){
                return res.json({success:true, mag:"thre are not post any job"})
            }

            return res.json({success:true , data:jobs});

    } catch (error) {
         console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }

}


export const  getjobsdetail = async (req,  res) =>{
    try {
       const { id } = req.params;

        const [jobs] = await db.query(`
            SELECT 
                    j.job_role,
                    j.id,
                    j.title AS job_title,
                    j.job_type,
                    j.location,
                    j.image_url,
                    j.status,
                    j.salary,
                    j.requirements,
                    j.description,
                    j.stipend,
                    j.duration,
                    j.deadline,
                    j.posted_at
                FROM jobs j
                WHERE j.id  = ?
                ORDER BY j.posted_at DESC
                LIMIT 1;
           
            `,[id])

            return res.json(jobs[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}

export const jobpost = async (req, res) => {
  try {
    const { id } = req.user;
    // const id = 3;

    if (!id) {
      return res.status(400).json({ success: false, msg: "User ID is required" });
    }

    const {
      job_type,
      company_name,
      title,
      job_role,
      description,
      requirements,
      location,
      details,
      deadline,
      stipend,
      duration,
      salary,
    } = req.body;

    // console.log(requirements)

    const imageUrl =
      "https://tse3.mm.bing.net/th/id/OIP.WqgoCnP4FPf-aB-RUAoFBAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3";

  
    if (!job_type) {
      return res.status(400).json({ success: false, msg: "Job type is required" });
    }

    if (!stipend && !salary) {
      return res.status(400).json({ success: false, msg: "Stipend or Salary is required" });
    }

    if (!title || !description || !deadline || requirements.length===0 || !location || !job_role) {
      return res.status(400).json({ success: false, msg: "All required fields must be filled" });
    }

    if (!duration) {
      return res.status(400).json({ success: false, msg: "Duration is required" });
    }

    const questions = {
      question1: "Why do you want to get this job?",
      question2: "Why should we hire you?",
      question3: "Can you describe a challenging situation?",
      question4: "What new skills are you hoping to gain?",
      question5: "How do you manage your time?",
    };

    const [recruiter] = await db.query(
      `
      SELECT r.organization, r.id, r.verification, r.role, r.is_banned
      FROM users r
      WHERE r.id = ?;
      `,
      [id]
    );

    if (!recruiter.length) {
      return res.status(404).json({ success: false, msg: "Recruiter not found" });
    }

    const user = recruiter[0];

    if (user.is_banned) {
      return res.status(403).json({ success: false, msg: "User is banned" });
    }

    if (!user.verification) {
      return res.status(403).json({ success: false, msg: "You are not verified" });
    }

    if (user.role !== "recruiter") {
      return res.status(403).json({ success: false, msg: "Role mismatch, only recruiters can post jobs" });
    }

    if (!company_name && !user.organization) {
      return res.status(400).json({ success: false, msg: "Company name is required" });
    }



    console.log({
  id,
  title,
  job_role,
  imageUrl,
  description: description || null,
  requirements: requirements || null,
  company_name: company_name || recruiter[0].organization,
  details: details || null,
  questions: JSON.stringify(questions),
  job_type,
  location,
  salary: salary || null,
  stipend: stipend || null,
  duration: duration || null,
  deadline
});


    const [post] = await db.query(
      `
      INSERT INTO jobs (
        recruiter_id,
        title,
        job_role,
        image_url,
        description,
        requirements,
        company_name,
        details,
        questions,
        job_type,
        location,
        salary,
        stipend,
        duration,
        deadline
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        title,
        job_role,
        imageUrl,
        description || null,
        requirements || null,
        company_name || user.organization,
        details || "",
        JSON.stringify(questions),
        job_type,
        location,
        salary || null,
        stipend || null,
        duration || null,
        deadline,
      ]
    );

    if (post.affectedRows !== 1) {
      return res.status(500).json({ success: false, msg: "Something went wrong while posting the job" });
    }

    return res.json({ success: true, msg: "Job posted successfully" });
  } catch (error) {
    console.error("Job Post Error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};








export const getApplicantsForJob = async (req, res) => {
  try {
    const recruiter_id = req.user.id; 
    // const recruiter_id = 2; 
    const { job_id } = req.body; 

    if (!job_id) {
      return res.status(400).json({ msg: "Job ID is required" });
    }

    const [applicants] = await db.query(
      `
      SELECT 
        a.id AS application_id,
        a.status,
        a.answer,
        a.resume_url,
        a.cover_letter_url,
        a.applied_at AS applied_at,
        u.id AS student_id,
        u.name,
        u.email,
        u.role,
        j.id AS job_id,
        j.title AS job_title,
        j.company_name,
        j.job_role,
        j.location,
        j.job_type
      FROM applications a
      INNER JOIN users u ON a.student_id = u.id
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE j.id = ? AND j.recruiter_id = ?
      ORDER BY a.applied_at DESC
      `,
      [job_id, recruiter_id]
    );

    console.log(applicants);
    
    return res.json(applicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};



export const updateApplicationStatus = async (req, res) => {
  try {
    const recruiter_id = req.user.id;
    
    if(!recruiter_id){
        return res.json({success:false, mag:"not authenticate"})
    }
    //  const recruiter_id = 6; 
    const { application_id } = req.body; 
    const { status } = req.body; 

    if (!application_id || !status) {
      return res.status(400).json({ msg: "Application ID and status are required" });
    }

    const [check] = await db.query(
      `
      SELECT a.id, j.recruiter_id 
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ? AND j.recruiter_id = ?
      `,
      [application_id, recruiter_id]
    );

    if (check.length === 0) {
      return res.status(403).json({ msg: "Not authorized to update this application" });
    }

    await db.query(
      `
      UPDATE applications 
      SET status = ? 
      WHERE id = ?
      `,
      [status, application_id]
    );

    res.json({ msg: "Application status updated successfully" });

    console.log("hello")
    const [rows] = await db.query(
      `
      SELECT 
          s.name AS userName,
          s.email,
          j.title AS jobTitle,
          j.company_name AS companyName,
          a.status AS status
      FROM applications a
      JOIN users s ON a.student_id = s.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
      `,
      [application_id]
    );

    try {
      const { subject, text, html } = applicationStatusEmail(rows[0].userName ,rows[0].jobTitle, rows[0].companyName, rows[0].status);
      await sendEmail(rows[0].email, subject, text, html);
    } catch (error) {
       console.error(error);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};




export const deleteJobPost = async (req, res) => {
  try {
    const recruiterId = req.user.id; 
    const { job_id } = req.params;   

    if (!job_id) {
      return res.status(400).json({
        success: false,
        msg: "Job ID is required",
      });
    }

    const [recruiter] = await db.query(
      `SELECT id, role, verification 
       FROM users 
       WHERE id = ?`,
      [recruiterId]
    );

    if (!recruiter.length) {
      return res.status(404).json({
        success: false,
        msg: "Recruiter not found",
      });
    }

    if (recruiter[0].role !== "recruiter") {
      return res.status(403).json({
        success: false,
        msg: "Only recruiters can delete jobs",
      });
    }

    if (!recruiter[0].verification) {
      return res.status(403).json({
        success: false,
        msg: "Recruiter is not verified",
      });
    }

 
    const [job] = await db.query(
      `SELECT id FROM jobs WHERE id = ? AND recruiter_id = ?`,
      [job_id, recruiterId]
    );

    if (!job.length) {
      return res.status(404).json({
        success: false,
        msg: "Job not found or you don't have permission to delete it",
      });
    }


    const [deleteResult] = await db.query(
      `DELETE FROM jobs WHERE id = ? AND recruiter_id = ? lIMIT 1`,
      [job_id, recruiterId]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        msg: "Failed to delete job",
      });
    }

    return res.json({
      success: true,
      msg: "Job deleted successfully",
      job_id,
    });

  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      msg: "Server error while deleting job",
    });
  }
};
