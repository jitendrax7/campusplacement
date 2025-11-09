import db from "../config/db/db.js";
import cloudinary from "../config/cloudinary.js"; 
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { fromPath } from "pdf2pic";
import sharp from "sharp";
import { sendEmail } from "../utils/mailer.js";
import { sendApplicationSuccessEmail } from "../emails/studentmail.js";


export const getjobs = async (req, res) => {
    try {
        
        const [jobs] = await db.query(`
            SELECT 
                    j.job_role,
                    j.id,
                    j.company_name,
                    j.title AS job_title,
                    j.job_type,
                    j.status,
                    j.location,
                    j.image_url,
                    j.salary,
                    j.stipend,
                    j.duration,
                    j.deadline,
                    j.posted_at
                FROM jobs j
                ORDER BY j.posted_at DESC
                LIMIT 10;
           
            `)
             
             if(jobs.length===0){
                return res.status(404).json({ msg: 'No job here' });
            }

    
            return res.json(jobs);

    } catch (error) {
         console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}


export const  getjobsdetail = async (req,  res) =>{
    try {
       const { id } = req.params;
    
       console.log(id);
       
        
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
                    j.requirements,
                    j.description,
                    j.details,
                    j.deadline,
                    j.posted_at,
                    j.company_name,
                    r.name AS recruiter_name
                FROM jobs j
                JOIN users r ON j.recruiter_id  = r.id
                WHERE j.id  = ?
                ORDER BY j.posted_at DESC
                LIMIT 1;
           
            `,[id])
          
            if(jobs.length===0){
                return res.status(404).json({ msg: 'No job here' });
            }

            return res.json(jobs[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}


export const get_question = async (req, res) => {
     
    try {
        const {job_id} = req.body;

         const [jobs] = await db.query(`
            SELECT 
                    j.id,
                    j.questions
                FROM jobs j
                WHERE j.id  = ?
                LIMIT 1;
            `,[job_id])
          
            if(jobs.length===0){
                return res.status(404).json({ msg: 'No job here' });
            }

            if(!jobs[0].questions){
                return res.status(404).json({ msg: 'No question here for this question' });
            }
 
            return res.json({success:true, question:jobs[0]})
    } catch (error) {
           console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}




export const applyjob = async (req, res) => {
  try {
    const { job_id, answers } = req.body;
    const student_id = req.user.id;
    // const student_id = 1;

    if (!job_id) return res.status(400).json({ msg: "Job ID is required" });
    if (!student_id) return res.status(401).json({ msg: "Unauthorized, login required" });

    if (!req.files || !req.files.resume) {
      return res.status(400).json({ msg: "Resume is required" });
    }

    const [check] = await db.query(
      `SELECT id, name, email, verification, is_banned FROM users WHERE id = ? LIMIT 1;`,
      [student_id]
    );

    if(check.length===0){
      return res.json({success:false, mag:"not authorized login  again"})
    }

    if (check[0].is_banned) return res.json({ success: false, msg: "User is banned" });

    if (!check[0].verification) return res.json({ success: false, msg: "User is not verified" });

    const [jobcheck] = await db.query(
      `SELECT id FROM jobs WHERE id = ? `,[job_id]
    )

    if(!jobcheck.length){
      return res.json({success:false, mag:"job is not exits"})
    }

    const [applyCheck] = await db.query(
      `SELECT id FROM applications WHERE student_id = ? AND job_id = ?`,
      [student_id, job_id]
    );

    if (applyCheck.length > 0) {
      return res.status(400).json({ success: false, msg: "You have already applied for this job" });
    }

    const resumeFile = req.files.resume[0];
    if (!resumeFile || resumeFile.size === 0) {
      return res.status(400).json({ msg: "Empty resume file" });
    }

   const resumepdfpath = resumeFile.path;

   const dataBuffer = fs.readFileSync(resumepdfpath);
   const pdfDoc = await PDFDocument.load(dataBuffer);
   const totalPages = pdfDoc.getPageCount();

    if(totalPages >10){
      return res.json({success:false , mag:"uplode only 1 pages pdf"})
    }

      // const filePath = result.path;

      
    const uploadResult = await cloudinary.uploader.upload(resumepdfpath, {
        folder: "resumes",
        resource_type: "image",
      });

     
    // console.log(uploadResult);
      


    fs.unlinkSync(resumepdfpath);
    const resume_url = uploadResult.secure_url.replace(".pdf", ".png");



    let coverLetterUrl = null;
    if (req.files.coverLetter) {
      const coverFile = req.files.coverLetter[0];
      if (!coverFile || coverFile.size === 0) {
        return res.status(400).json({ msg: "Empty cover letter file" });
      }

      const coverResult = await cloudinary.uploader.upload(coverFile.path, {
        folder: "coverLetters",
        resource_type: "raw",
      });
      coverLetterUrl = coverResult.secure_url;

      fs.unlinkSync(coverFile.path);
    }


    const [result] = await db.query(
      `
      INSERT INTO applications (student_id, job_id, resume_url, cover_letter_url, answer, status)
      VALUES (?, ?, ?, ?, ?, 'Applied')
      `,
      [
        student_id,
        job_id,
        resume_url, 
        coverLetterUrl,
        answers && answers.trim() !== "" ? answers : null,
      ]
    );

    res.status(201).json({ msg: "Job application submitted successfully", application_id: result.insertId, });
 
    const [jobDetails] = await db.query(`SELECT title, company_name FROM jobs WHERE id = ?`, [job_id]);
    if (jobDetails.length > 0) {
      const { title, company_name } = jobDetails[0];
      try {
        const { subject, text, html } = sendApplicationSuccessEmail(check[0].name || "", title, company_name);
        await sendEmail(check[0].email, subject, text, html);
      } catch (error) {
        console.log(error);
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};


export const myapplication = async (req, res) => {
       const id = req.user.id; 
      //  const id = 1; 
     
    //    console.log(id);
       
    try {
 
        const [myApplications] = await db.query(`
            SELECT 
                a.id AS application_id,
                a.applied_at,
                a.resume_url,
                a.cover_letter_url,
                a.status,
                j.job_role,
                j.id AS job_id,
                j.company_name,
                j.title AS job_title,
                j.job_type,
                j.location,
                j.image_url,
                j.salary,
                j.stipend,
                j.duration,
                j.deadline,
                j.posted_at
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.student_id = ?
            ORDER BY a.applied_at DESC;
        `, [id]);
            
        console.log(myApplications);
        
             if(myApplications.length===0){
                return res.json({ msg: 'No appled jobs or internship' });
            }

            return res.json({success:true,data:myApplications});

    } catch (error) {
         console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
}



export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id; 


    const {
      current_semester,
      program_name,
      department_name,
      cgpa,
      academic_year,
      skills,
      certificates,
      resume_url,
      projects,
      achievements,
    } = req.body;

    console.log(skills);
    
   
    const [existing] = await db.query(
      "SELECT skills, program_name,department_name, certificates, projects, achievements FROM student_details WHERE user_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const prevData = existing[0];

    const mergedSkills = skills
      ? [...new Set([...(JSON.parse(prevData.skills || "[]")), ...skills])]
      : undefined;

    const mergedCertificates = certificates
      ? [...new Set([...(JSON.parse(prevData.certificates || "[]")), ...certificates])]
      : undefined;

    const mergedProjects = projects
      ? [...new Set([...(JSON.parse(prevData.projects || "[]")), ...projects])]
      : undefined;

    const mergedAchievements = achievements
      ? [...new Set([...(JSON.parse(prevData.achievements || "[]")), ...achievements])]
      : undefined;


    const fields = [];
    const values = [];


    if (current_semester !== undefined) {
      fields.push("current_semester = ?");
      values.push(current_semester);
    }
    if (program_name !== undefined) {
      fields.push("program_name = ?");
      values.push(program_name);
    }
    if (department_name !== undefined) {
      fields.push("department_name = ?");
      values.push(department_name);
    }
    if (cgpa !== undefined) {
      fields.push("cgpa = ?");
      values.push(cgpa);
    }

    if (academic_year !== undefined) {
      fields.push("academic_year = ?");
      values.push(academic_year);
    }
    if (mergedSkills !== undefined) {
      fields.push("skills = ?");
      values.push(JSON.stringify(mergedSkills));
    }
    if (mergedCertificates !== undefined) {
      fields.push("certificates = ?");
      values.push(JSON.stringify(mergedCertificates));
    }
    if (resume_url !== undefined) {
      fields.push("resume_url = ?");
      values.push(resume_url);
    }
    if (mergedProjects !== undefined) {
      fields.push("projects = ?");
      values.push(JSON.stringify(mergedProjects));
    }
    if (mergedAchievements !== undefined) {
      fields.push("achievements = ?");
      values.push(JSON.stringify(mergedAchievements));
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

 
    const query = `UPDATE student_details SET ${fields.join(", ")} WHERE user_id = ?`;
    values.push(userId);

    await db.query(query, values);

    res.json({
      success: true,
      message: "Profile updated successfully (with merged skills, certificates, etc.)",
    });
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile"
    });
  }
};



export const createCollegeRequest = async (req, res) => {
  try {
    const studentId = req.user.id; 


    const { college_code, remarks } = req.body;

    if (!college_code) {
      return res.status(400).json({
        success: false,
        message: "college_code is required",
      });
    }

    console.log(college_code)

    const [college] = await db.query(
      `SELECT id FROM colleges_placement_shell WHERE college_code = ?`,
      [college_code]
    );

    if (college.length === 0) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const [existing] = await db.query(
      `SELECT * FROM collage_student_request 
       WHERE student_id = ? AND college_code = ? AND status = 'Pending'`,
      [studentId, college_code]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this college",
      });
    }

    const [result] = await db.query(
      `INSERT INTO collage_student_request 
       (student_id, college_code, remarks) 
       VALUES (?, ?, ?)`,
      [studentId, college_code, remarks || null]
    );

    res.status(201).json({
      success: true,
      message: "College request created successfully",
      requestId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating college request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating request"
    });
  }
};





export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id; 

    const [userRows] = await db.query(
      `SELECT id, name, email, role, verification, profile_image_url 
       FROM users 
       WHERE id=? AND role='student'`,
      [studentId]
    );

    if (!userRows.length) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const user = userRows[0];


    const [studentRows] = await db.query(
      `SELECT college_code,college_verified, college_name, program_name, department_name, current_semester, cgpa, academic_year,
              skills, certificates, projects, achievements, resume_url, created_at
       FROM student_details
       WHERE user_id=?`,
      [studentId]
    );

    if (!studentRows.length) {
      return res.status(404).json({ success: false, message: "Student prifile details not found" });
    }

    let studentDetails = {};
    if (studentRows.length) {
      studentDetails = studentRows[0];
    }

    res.status(200).json({
      success: true,
      profile: {
        ...user,
        ...studentDetails
      }
    });

  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
