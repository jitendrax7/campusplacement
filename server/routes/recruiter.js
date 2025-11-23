import express from 'express';
// import multer from 'multer';
import  authw  from '../middleware/authw.js';
import { deleteJobPost, getApplicantsForJob, getjobpost, getjobsdetail, getRecruiterDashboard, jobpost, updateApplicationStatus } from '../controllers/recruiterController.js';


const recruiter = express.Router();


recruiter.get('/get-stats',authw("recruiter"), getRecruiterDashboard); 
recruiter.get('/get-jobs',authw("recruiter"), getjobpost); 
recruiter.get('/get-jobs/:id',authw(["recruiter"]), getjobsdetail);  
recruiter.post('/job-post',authw(["recruiter"]), jobpost)  
recruiter.delete('/delete-jobs/:job_id',authw(["recruiter"]), deleteJobPost)  
recruiter.post('/get-applicants',authw(["recruiter"]), getApplicantsForJob) 
recruiter.put('/update-application-status',authw(["recruiter"]), updateApplicationStatus) 


export default recruiter; 