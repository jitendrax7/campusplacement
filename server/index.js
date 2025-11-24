import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import initSchema from './config/db/schema.js';
import student from './routes/student.js';
import auth from './routes/auth.js';
import recruiter from './routes/recruiter.js';
import collage from './routes/collage.js';

const app = express();

initSchema()
  
app.use(cors({}));
app.use(express.json());


app.get('/',(req,res)=>{
    res.send("API Working")
})
app.get('/api',(req,res)=>{
    res.send("API Working")
})
 

app.use('/api/auth', auth);
app.use('/api/student', student );
app.use('/api/recruiter', recruiter );
app.use('/api/admin', collage );

const PORT = 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`)); 


   