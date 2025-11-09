

import { sendEmail } from "../utils/mailer.js";
import { otpVerificationEmail , sendRecruiterSuccessEmail, sendStudentSuccessEmail } from "../emails/authemail.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db/db.js";




function validateAndNormalizeEmail(email) {
  if (typeof email !== "string") return null;

  email = email.trim().toLowerCase();


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return null;

  let [local, domain] = email.split("@");
  if (!local || !domain) return null; 

  if (local.includes("+")) return null;

 
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.split("+")[0];
    local = local.replace(/\./g, ""); 
    domain = "gmail.com";
  } 

  return `${local}@${domain}`;
}



export const register = async (req, res) => {
 
   
    const role = req.body.role ?req.body.role: "student";    
  
  const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
    return res.json({ success: false, msg: "All fields are required" });
  }
  const {organization ,position } = req.body;

  if(role === "recruiter" && !organization){
      return res.json({success:false , msg:"for the recruiters organization name is requred "})
  }
  
  console.log("Registering user:", { name, email, password, phone ,role });
  

  const userEmail = validateAndNormalizeEmail(email);
  
      if (!userEmail) {
          return res.json({ success: false, msg: "Invalid email format" });
        }
        try {
            if (
          phone.length < 10 ||
          phone.length > 15 ||
          !/^\d+$/.test(phone) ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail) ||
          name.length < 3 ||
          name.length > 30
        ) {
          return res.json({ success: false, msg: "Invalid input data" });
        }
      
        const [existingUser] = await db.execute(
            "SELECT id , email, phone FROM users WHERE email = ? OR phone = ? lIMIT 1",
            [userEmail , phone]
          );

          if(existingUser.length > 0 && existingUser[0].phone === phone ){
            return res.json({ success: false, msg: "user alredy register with this number" });
          }
          if (existingUser.length > 0 && existingUser[0].email === userEmail) {
              return res.json({ success: false, msg: "User already exists" });
          }
        
        
    } catch (error) {
        console.error("Error in registration:", error);
        return res
        .status(500)
        .json({ success: false, msg: "Internal server error" });
    }

    try {
    
        const hash = await bcrypt.hash(password, 10);
     

           const [result] = await db.execute(
             "INSERT INTO users (name, email, password , phone, role, organization ,position ) VALUES (?,?, ?,? ,?,?,?)",
             [ name, userEmail, hash, phone , role, (organization ||"") ,(position || "")]
           );


         const [rows] = await db.execute(
           `SELECT id,name as userName, email, role FROM users WHERE email = ? LIMIT 1`,
           [userEmail]
         );
    
        if (!rows.length){
          return res.json({ success: false, msg: "Registration failed" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        const [result1] = await db.query(
          `UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?`,
          [otp, expires, rows[0].id]
        );


       
         try {
            
            const { subject, text, html } = otpVerificationEmail(rows[0].userName || "" , otp);
            await sendEmail(rows[0].email, subject, text, html);
         } catch (error) {
            console.log(error);
            return res.json({success:false, msg:"server error to send the mail"})
            
         }

        console.log(rows[0]);
    
        res.json({
          success: true,
          id: rows[0].id,
          msg: "Registration pending, OTP sent to your email",
        });

      } catch (e) {
        console.log(e);
        res.json({ success: false, msg: e.massage });
      }
    };
    




export const verifyOtp = async (req, res) => {
    // const role = req.body.role ?req.body.role: "student";
  const { otp } = req.body;
  const { id } = req.body;

  console.log( "verify otp :" , otp ,id)
  try {
    const [rows] = await db.query(
      "SELECT  id , email, name, role , otp_code, otp_expires , organization FROM users WHERE id = ?",
      [id]
     );

    if (!rows.length) return res.status(400).json({ msg: "No user" });

    const user = rows[0];
    if (!user.otp_code || !user.otp_expires) {
      return res.status(400).json({ msg: "No OTP found, please request a new one" });
    }

    if (user.otp_code !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    await db.query(
      "UPDATE users SET verification = 1, otp_code = NULL, otp_expires = NULL WHERE id = ?",
      [id]
    );

    delete user.otp_code;
    delete user.otp_expires;

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

     if (user.role === "student") {
        try {
          const [existingProfile] = await db.query(
            `SELECT id FROM student_details WHERE user_id = ?`,
            [user.id]
          );
        
          if (existingProfile.length === 0) {
            await db.query(
              `INSERT INTO student_details (user_id) VALUES (?)`,
              [user.id]
            );
          } else {
             return res.json({success:false , mag:"Student profile already exists "})
          }
        
        } catch (error) {
          console.error("Error creating student profile:", error);
          return res.status(500).json({success:false, mag:"server error"})
        }
      }

     
    res.json({
      success: true,
      msg: "Verification successful",
      token,
      user: user,
    });

   

  
     try {    
       
        if(user.role==="recruiter"){
          const { subject, text, html } = sendRecruiterSuccessEmail(user.name || "",user.organization ); 
          await sendEmail(user.email, subject, text, html);
        }else{
          const { subject, text, html } = sendStudentSuccessEmail(user.name || "");
          await sendEmail(user.email, subject, text, html);
        }
     } catch (error) {
        console.error("Error in verification email:", error);
     }
     
   
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};


export const login = async (req, res) => {
    // const role = req.body.role?req.body.role: "student";
    // const role = "recruiter";
  const { email, password } = req.body;

  if(!email || !password){
    return res.json({success:false,msg:"email and password are requared"})
  }

  console.log(email, password);

  // console.log(rows[0]);
    
  const [rows] = await db.query(
    "SELECT id , name, email, verification,password, role , is_banned,created_at FROM users WHERE email=?",
    [email]
  );

  // console.log(rows[0]);
  if (!rows.length) return res.json({ success: false, msg: "No user" });
 
  if (rows[0].is_banned){
    return res.json({ success: false, msg: "User is banned" });
  }
   

  const valid = await bcrypt.compare(password, rows[0].password);
  
  if (!valid) return res.json({ success: false, msg: "Bad password" });

  if(!rows[0].role){
    return res.json({success:false,mag:"role missing or mismatch"})
  }
  

  const token = jwt.sign(
    { id: rows[0].id, role: rows[0].role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  delete rows[0].password; 

  console.log(rows[0]);

  res.json({ success: true, token, user: rows[0] });

};





export const getuserdata = async (req, res) => {
  const { id } = req.user;
  const [rows] = await db.query(
    "SELECT id, is_banned ,name, email, role ,profile_image_url, verification  FROM users WHERE id=?",
    [id]
  );

  if (!rows.length) return res.status(400).json({ msg: "No user" });

  // console.log(rows);


let profile_completion = 0;
let college_verified  = false;
    if (rows[0].role === "student") {
      const [studentRows] = await db.query(
        `SELECT college_name,college_verified , program_name, current_semester, cgpa, academic_year
         FROM student_details
         WHERE user_id=?`,
        [id]
      );

      if (studentRows.length) {
        const student = studentRows[0];

        if ( student.college_name || student.program_name || student.current_semester ||student.department_name || student.cgpa || student.academic_year) {
          profile_completion = 1;
        }
        if (student.college_verified) {
          college_verified = true;
        }
        rows[0].college_verified = student.college_verified;
        rows[0].profile_completion = profile_completion;
      }

    }   

  res.json({...rows[0]});
};

