import db from "../config/db/db.js";
import { applicationStatusEmail } from "../emails/studentmail.js";
import { sendEmail } from "../utils/mailer.js";


export const staticdata = async (req, res) =>{
 
      const college_code = 585001;

    try {
        

        const [stats] = await db.query(`
            SELECT
                (SELECT COUNT(*) 
                 FROM student_details 
                 WHERE college_code = ?) AS total_students,
                    
                    
                (SELECT COUNT(DISTINCT a.student_id) 
                 FROM applications a
                 JOIN student_details s ON a.student_id = s.user_id
                 WHERE a.status = 'Selected' AND s.college_code = ?) AS placed_students,
                    
                    
                (SELECT COUNT(*) 
                 FROM jobs j
                 WHERE j.deadline >= CURDATE() AND j.college_code = ?) AS active_opportunities,
                    
                    
                (SELECT COUNT(DISTINCT a.student_id) 
                 FROM applications a
                 JOIN student_details s ON a.student_id = s.user_id
                 WHERE a.status = 'Applied' AND s.college_code = ?) AS pending_applications,
                    
                    
                (SELECT COUNT(DISTINCT a.student_id) 
                 FROM applications a
                 JOIN student_details s ON a.student_id = s.user_id
                 WHERE a.status = 'Interview' AND s.college_code = ?) AS interview_scheduled;
               `,[college_code,college_code,college_code,college_code,college_code]);

        console.log(stats)    
 
        if(stats.length===0){
            return res.json({success:false,mag:"not avalble"})
        }
         
        return res.json({success:true , stats:[
            { name: "Total Students", value: stats[0].total_students, change: "+12%" },
          { name: "Placed Students", value:stats[0].placed_students , change: "+8%" },
          { name: "Active Opportunities", value: stats[0].active_opportunities, change: "+5%" },
          { name: "Pending Applications", value: stats[0].pending_applications, change: "-3%" },
          { name: "Interviews Scheduled", value: stats[0].interview_scheduled, change: "+15%" },
          { name: "Placement Rate", value: 49.5, change: "+2.1%" }
        ]})
         
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}


export const getjobpost = async (req, res) => {
  
     try {
         
        // const {id} = req.user;
        // const id  =  1;
        const college_code = 585001;

        const [jobs] = await db.query(`
            SELECT 
                    j.job_role,
                    j.id,
                    j.title AS title,
                    j.job_type,
                    j.location,
                    j.image_url,
                    j.description,
                    j.requirements,
                    j.details,
                    j.salary,
                    j.stipend,
                    j.duration,
                    j.status,
                    j.deadline,
                    j.posted_at
                FROM jobs j
                WHERE j.college_code = ?
                ORDER BY j.posted_at DESC
                LIMIT 10;
           
            `,[college_code])

            //  console.log(jobs);
              
             
            
            return res.json(jobs);

    } catch (error) {
         console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }

}


export const  getjobsdetail = async (req,  res) =>{
    try {
       const { id } = req.params;
      //  const id = 1;

        const [jobs] = await db.query(`
            SELECT 
                    j.company_name ,
                    j.job_role,
                    j.id,
                    j.status,
                    j.title AS job_title,
                    j.job_type,
                    j.location,
                    j.image_url,
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


 




export const  jobpost = async (req,  res) =>{

    try {
        // const {id} = req.user;
        const id = 3;
        const college_code = 585001;
        const company_name  = "Microshoft";
        const imageUrl = "https://venngage-wordpress.s3.amazonaws.com/uploads/2021/09/c0864f2a-16db-46fe-96a5-fea8f91908d5.png";
        const {job_type , title  ,job_role , description , requirements  ,  location ,details, deadline ,stipend , duration,compensationAmount ,compensationType    } = req.body;
   
       const questions = {
            "question1": "Why do you want to get this job?",
            "question2": "Why should we hire you?",
            "question3": "Can you describe a challenging situation?",
            "question4": "What new skills are you hoping to gain?",
            "question5": "How do you manage your time?"  
        };


        if(!job_type ){
            return res.json({success:false, msg:"job type is requred"})
        }

        if(job_type === "Internship" && (!compensationAmount || !duration )){
              return res.json({success:false, msg:"for intership duration and stipend is requred"});
        }

        if(job_type !== "Internship" && !compensationAmount){
          return res.json({success:false, msg:"salery is requred"});
        }

        console.log("job post detail:" , title ,company_name ,description , deadline , requirements ,location , job_role)
        
        if(!title || !company_name ||  !description  || !deadline  ||  !requirements  || !location  || !job_role || !compensationType){
            return res.json({success:false, msg:"All fileds are requred"})
        }

        const [recruiter] = await db.query(`
            SELECT 
                r.id,
                r.verification, 
                r.role
            FROM users r
            WHERE r.id = ?;
        `, [id]); 

        console.log(recruiter);
 
        if(!recruiter[0].verification){
            return res.json({success:false, msg:"you are not verified"})
        }

        if(recruiter[0].role !== "recruiter"){
            return res.json({success:false, msg:"role mismatch"});
        }

        console.log("id:" ,id, "compansestiontype", compensationType, "comansestionamount:", compensationAmount )

        const [post] = await db.query(`
          INSERT INTO jobs (
            recruiter_id,
            college_code,
            title,
            job_role,
            image_url,
            description,
            requirements,
            questions,
            company_name,
            details,
            job_type,
            location,
            salary,
            stipend,
            duration,
            deadline
          ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
        `, [
          id,college_code,title,job_role,imageUrl,description, requirements,!questions?null : JSON.stringify(questions), company_name ,(!details?"":details),job_type,location,(compensationType==="salary"?compensationAmount:null),(compensationType==="stipend"?compensationAmount:null),(!duration?"":duration),deadline       
        ]);

        // console.log(  id,title,job_role,imageUrl,description, requirements,questions? questions : null, company_name ,(!details?"":details),job_type,location,(compensationType==="salary"?compensationAmount:null),(compensationType==="stipend"?compensationAmount:null),(!duration?"":duration),deadline       
        // );
        
 

        if(post.affectedRows !== 1){
            return res.json({success:false, mag:"sumething went wrong to post"})
        } 

        return res.json({success:true, mag:"job post successfull"})
        

    } catch (error) {
         console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}




export const getAllApplications = async (req, res) => {

    // const id = req.user.id;
   
    // if(req.user.role !== "admin"){
    //     return res.json({success:false, mag:"this is for admin you are not admin"})
    // }  
    
    const college_code = 585001;

  try {
    // const [rows] = await db.query(
    //   `SELECT 
    //       a.id AS application_id,
    //       a.job_id,
    //       j.title AS job_title,
    //       j.job_role,
    //       j.location,
    //       j.company_name,
    //       j.job_type,
    //       j.description ,
    //       j.requirements, 
    //       j.details,
    //       j.deadline,
    //       u.id AS user_id,
    //       u.name AS applicant_name,
    //       u.email AS applicant_email,
    //       a.status,
    //       a.applied_at
    //     FROM applications a
    //     JOIN users u ON a.student_id = u.id
    //     JOIN jobs j ON a.job_id = j.id
    //     ORDER BY a.applied_at DESC`
    // );


    const [rows] = await db.query(
      `SELECT 
          a.id AS application_id, 
          a.job_id,
          j.title AS job_title,
          j.job_role,
          j.location,
          j.company_name,
          j.job_type,
          j.deadline,
          u.id AS user_id,
          u.name AS applicant_name,
          u.email AS applicant_email,
          a.status,
          a.applied_at
        FROM applications a
        JOIN users u ON a.student_id = u.id
        JOIN jobs j ON a.job_id = j.id
        WHERE j.college_code = ?
        ORDER BY a.applied_at DESC`,
      [college_code]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        applications: [],
        message: "No applications found"
      });
    }

    res.json({
      success: true,
      applications: rows
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications"
    });
  }
};


export const getApplicationDetails = async (req, res) => {
  try {
    const { application_id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        a.id AS application_id,
        a.resume_url,
        a.cover_letter_url,
        a.answer,
        a.status,
        a.applied_at,

        -- Student Info
        s.id AS student_id,
        s.name AS student_name,
        s.email AS student_email,
        s.phone AS student_phone,

        -- Job Info
        j.id AS job_id,
        j.title AS job_title,
        j.job_role,
        j.company_name,
        j.description AS job_description,
        j.requirements,
        j.location,
        j.salary,
        j.stipend,
        j.duration,
        j.deadline,

        -- Recruiter Info
        r.id AS recruiter_id,
        r.name AS recruiter_name,
        r.organization AS recruiter_organization,
        r.position AS recruiter_position,
        r.email AS recruiter_email

      FROM applications a
      JOIN users s ON a.student_id = s.id
      JOIN jobs j ON a.job_id = j.id
      JOIN users r ON j.recruiter_id = r.id
      WHERE a.id = ?
      `,
      [application_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching application details:", error);
    res.status(500).json({ message: "Server error" });
  }
};





export const updateApplicationStatus = async (req, res) => {
  try {
    // const recruiter_id = req.user.id;
    
    // if(!recruiter_id){
    //     return res.json({success:false, mag:"not authenticate"})
    // }
    //  const recruiter_id = 6; 
    const { application_id } = req.body; 
    const { status } = req.body; 

    if (!application_id || !status) {
      return res.status(400).json({ msg: "Application ID and status are required" });
    }

    // const [check] = await db.query(
    //   `
    //   SELECT a.id, j.recruiter_id 
    //   FROM applications a
    //   INNER JOIN jobs j ON a.job_id = j.id
    //   WHERE a.id = ? AND j.recruiter_id = ?
    //   `,
    //   [application_id, recruiter_id]
    // );

    // if (check.length === 0) {
    //   return res.status(403).json({ msg: "Not authorized to update this application" });
    // }

    await db.query(
      `
      UPDATE applications 
      SET status = ? 
      WHERE id = ?
      `,
      [status, application_id]
    );

     res.json({ msg: "Application status updated successfully" });

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






export const getStudentRequests = async (req, res) => {
  try {

    const collegeId = 585001; 


    const [requests] = await db.query(
      `SELECT csr.id AS request_id, 
              u.id AS student_id,
              u.name AS student_name,
              u.email AS student_email,
              sd.program_name,
              sd.department_name,
              csr.status,
              csr.requested_at AS applied_at,
              csr.remarks
       FROM collage_student_request csr
       JOIN users u ON csr.student_id = u.id
       LEFT JOIN student_details sd ON u.id = sd.user_id
       WHERE csr.college_code = ? 
       ORDER BY csr.requested_at DESC
       LIMIT 10`,
      [collegeId]
    );
  


    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student requests",
    });
  }
};


export const updateCollegeRequestStatus = async (req, res) => {
  try {
    // const collegeId = req.user.id; 
    const collegeId = 1; 
    const { requestId } = req.body; 
    const { status, remarks } = req.body; 

    if(!requestId){
      return res.json({success:false,msg:"request id is requared"})
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'Approved' or 'Rejected'",
      });
    }

    const [collegeRows] = await db.query(
      `SELECT name , college_code FROM colleges_placement_shell WHERE id = ?`,
      [collegeId]
    );
 
    const college_code = collegeRows[0].college_code;
     
    const [requestRows] = await db.query(
      `SELECT student_id, college_code 
       FROM collage_student_request 
       WHERE id = ? AND college_code = ?`,
      [requestId, college_code]
    );

    if (!requestRows.length) {
      return res.status(404).json({
        success: false,
        message: "Request not found or unauthorized",
      });
    }

    const studentId = requestRows[0].student_id;

  

    const collegeName = collegeRows.length ? collegeRows[0].name : null;
    console.log(collegeRows)

    const [result] = await db.query(
      `UPDATE collage_student_request 
       SET status = ?, approved_by = ?, approved_at = NOW(), remarks = ?
       WHERE id = ? AND college_code = ?`,
      [status, college_code, remarks || null, requestId, college_code]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Failed to update request",
      });
    }

    if (status === "Approved") {
      await db.query(
        `UPDATE student_details
         SET college_verified = TRUE, college_code = ?, college_name = ?
         WHERE user_id = ?`,
        [college_code, collegeName, studentId]
      );
    }

    res.status(200).json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      approved_by: college_code,
      college_name: collegeName,
    });
  } catch (error) {
    console.error("Error updating college request status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating request status",
      error: error.message,
    });
  }
};



export const updateJobDetail = async (req, res) => {
  try {
    const recruiterId = 3; // Example logged-in recruiter (replace with req.user.id)
    const { jobId } = req.body; // Job ID from URL
    const college_code = 585001;

    console.log(req.body);
    

    if (!jobId) {
      return res.status(400).json({ msg: "Job ID is required" });
    }

    // Constant details (not editable from client for now)
    const imageUrl =
      "https://venngage-wordpress.s3.amazonaws.com/uploads/2021/09/c0864f2a-16db-46fe-96a5-fea8f91908d5.png";
    const questions = {
      question1: "Why do you want to get this job?",
      question2: "Why should we hire you?",
      question3: "Can you describe a challenging situation?",
      question4: "What new skills are you hoping to gain?",
      question5: "How do you manage your time?",
    };

    const {
      job_type,
      title,
      job_role,
      description,
      requirements,
      location,
      details,
      deadline,
      stipend,
      duration,
      compensationAmount,
      compensationType,
      company_name,
    } = req.body;

    console.log("compensationType:",compensationType);
    
    const [recruiter] = await db.query(
      `
        SELECT r.id, r.verification, r.role
        FROM users r
        WHERE r.id = ?;
      `,
      [recruiterId]
    );

    if (!recruiter.length || !recruiter[0].verification) {
      return res.json({ success: false, msg: "You are not verified" });
    }

    if (recruiter[0].role !== "recruiter") {
      return res.json({ success: false, msg: "Role mismatch" });
    }

    // Get current job details
    console.log(jobId, college_code);
    
    const [currentJobRows] = await db.query(
      `SELECT * FROM jobs WHERE id = ? AND college_code = ?`,
      [jobId ,college_code]
    );

    if (!currentJobRows.length) {
      return res.status(404).json({ success: false, msg: "Job not found" });
    }

    const currentJob = currentJobRows[0];

    // Merge new data with old data
    const updatedData = {
      title: title || currentJob.title,
      job_role: job_role || currentJob.job_role,
      description: description || currentJob.description,
      requirements: requirements || currentJob.requirements,
      details: details || currentJob.details,
      job_type: job_type || currentJob.job_type,
      location: location || currentJob.location,
      deadline: deadline || currentJob.deadline,
      company_name: company_name || currentJob.company_name,
      salary:
        compensationType === "salary"
          ? compensationAmount
          : currentJob.salary,
      stipend:
        compensationType === "stipend"
          ? compensationAmount
          : currentJob.stipend,
      duration: duration || currentJob.duration,
      image_url: imageUrl, // constant
      questions: JSON.stringify(questions), // constant
    };
 
    console.log(compensationType ,compensationAmount)

    function toMySQLDate(input) {
  const d = new Date(input);
  if (isNaN(d)) throw new Error('Invalid date: ' + input);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}



    // Update query
    const [updateResult] = await db.query(
      `
      UPDATE jobs 
      SET 
        title = ?, 
        job_role = ?, 
        description = ?, 
        requirements = ?, 
        details = ?, 
        job_type = ?, 
        location = ?, 
        deadline = ?, 
        company_name = ?,
        salary = ?, 
        stipend = ?, 
        duration = ?, 
        image_url = ?, 
        questions = ?
      WHERE id = ? AND college_code = ?
      `,
      [
        updatedData.title,
        updatedData.job_role,
        updatedData.description,
        updatedData.requirements,
        updatedData.details,
        updatedData.job_type,
        updatedData.location,
        toMySQLDate(updatedData.deadline),
        updatedData.company_name,
        updatedData.salary,
        updatedData.stipend,
        updatedData.duration,
        updatedData.image_url,
        updatedData.questions,
        jobId,
        college_code,
      ]
    );

    if (updateResult.affectedRows === 0) {
      return res.json({
        success: false,
        msg: "No changes made or job not found",
      });
    }

    return res.json({
      success: true,
      msg: "Job updated successfully",
      updatedJob: updatedData, // send updated details back
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};



export const deleteJob = async (req, res) => {
  try {
    // const recruiterId = req.user.id;
    const recruiterId = 1;
    const college_code = 585001;
    const { job_id } = req.params;  

    
    const [jobRows] = await db.query(
      `SELECT id FROM jobs WHERE id = ? AND college_code = ?`,
      [job_id, college_code]
    );

    if (!jobRows.length) {
      return res.status(404).json({
        success: false,
        msg: "Job not found or you don't have permission to delete it",
      });
    }

    const [deleteResult] = await db.query(
      `DELETE FROM jobs WHERE id = ? AND college_code = ? LIMIT 1 `,
      [job_id, college_code]
    );

    if (deleteResult.affectedRows === 0) {
      return res.json({ success: false, msg: "Failed to delete job" });
    }

    return res.json({
      success: true,
      msg: "Job deleted successfully",
      job_id,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
