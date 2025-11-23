import express from 'express';
import multer from 'multer';
import  authw  from '../middleware/authw.js';
import upload from "../middleware/upload.js";
import { getjobs , getjobsdetail ,get_question,applyjob  ,myapplication, createCollegeRequest, updateStudentProfile, getStudentProfile} from '../controllers/userController.js';


const student = express.Router();


student.get('/get-profile',authw(), getStudentProfile);
student.put('/update-profile',authw(), updateStudentProfile);
student.get('/get-jobs',authw(), getjobs);
student.get('/get-jobs/:id',authw(), getjobsdetail);
student.post('/get-jobs-question',authw(), get_question);

student.post(
  "/apply-job",
  authw(),
  upload.fields([
    { name: "resume", maxCount: 1 },       
    { name: "coverLetter", maxCount: 1 }, 
  ]),
  
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, msg: "File size should not exceed 5 MB" });
      }
      return res.status(400).json({ success: false, msg: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, msg: err.message });
    }
    next();
  },
  applyjob
);


student.get('/my-application',authw(), myapplication);

student.post('/send-collage-request',authw(), createCollegeRequest);

export default student;