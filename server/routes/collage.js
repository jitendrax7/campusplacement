import express from 'express';
import multer from 'multer';
import  authw  from '../middleware/authw.js';
import { deleteJob, getAllApplications, getApplicationDetails, getjobpost ,getjobsdetail ,getStudentRequests,staticdata, updateApplicationStatus, updateCollegeRequestStatus, updateJobDetail } from '../controllers/adminController.js';
import { jobpost } from '../controllers/adminController.js';


const collage = express.Router();


collage.get('/get-static', staticdata);
collage.get('/get-jobs', getjobpost);
collage.get('/get-jobs/:id', getjobsdetail);
collage.post('/job-post', jobpost)
collage.put('/edit-post', updateJobDetail)
collage.delete('/delete-post/:job_id', deleteJob)
collage.get('/get-applications', getAllApplications)
collage.get('/get-applications/:application_id', getApplicationDetails)
collage.put('/update-application-status', updateApplicationStatus)
collage.get('/get-students-requests', getStudentRequests)
collage.put('/update-students-request-status', updateCollegeRequestStatus)


export default collage;
