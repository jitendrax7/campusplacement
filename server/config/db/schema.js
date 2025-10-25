import pool from "./db.js"; 


const initSchema = async () => {

     try {
        const connection = await pool.getConnection();


       await connection.query(`
          CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(100) NOT NULL,
              email VARCHAR(150) UNIQUE NOT NULL,
              phone VARCHAR(15) UNIQUE NOT NULL,
              role ENUM('student','recruiter', 'placement_cell') DEFAULT 'student',
              password VARCHAR(255) NOT NULL,
              profile_image_url VARCHAR(500),
              organization VARCHAR(255) NOT NULL,  
              position VARCHAR(100),
              is_banned BOOLEAN DEFAULT FALSE,
              verification BOOLEAN DEFAULT FALSE,
              otp_code VARCHAR(6),
              otp_expires TIMESTAMP,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
      `);


       await connection.query(`
          
          CREATE TABLE IF NOT EXISTS student_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,  
                college_verified BOOLEAN DEFAULT FALSE,
                college_code INT,
                college_name VARCHAR(255),
                department_name VARCHAR(255),
                program_name VARCHAR(255),
                current_semester VARCHAR(50),
                cgpa DECIMAL(4,2),
                academic_year VARCHAR(20),
                skills JSON,          
                certificates JSON,    
                resume_url VARCHAR(500),
                projects JSON,       
                achievements JSON,   
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `)


        await connection.query(`
            CREATE TABLE IF NOT EXISTS colleges_placement_shell (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,              
                college_code VARCHAR(50) UNIQUE,                 
                email VARCHAR(150) UNIQUE NOT NULL,     
                phone VARCHAR(20) UNIQUE NOT NULL,       
                address TEXT NOT NULL,                   
                city VARCHAR(100),
                state VARCHAR(100),
                country VARCHAR(100) DEFAULT 'India',
                website_url VARCHAR(255),                
                logo_url VARCHAR(500),                   
                description TEXT,                        
                established_year YEAR,                 
                accreditation VARCHAR(255),              
                verified BOOLEAN DEFAULT FALSE,          
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            `)

          await connection.query(`
                CREATE TABLE IF NOT EXISTS jobs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    recruiter_id INT NOT NULL,
                    college_code INT DEFAULT NULL,
                    company_name VARCHAR(255) NOT NULL, 
                    title VARCHAR(255) NOT NULL,
                    job_role VARCHAR(100) NOT NULL,
                    image_url VARCHAR(500),
                    description TEXT,
                    requirements TEXT,
                    questions JSON,
                    details TEXT,
                    job_type  VARCHAR(255) DEFAULT 'Full-Time',
                    location VARCHAR(255),
                    salary DECIMAL(10,2) DEFAULT NULL,  
                    stipend DECIMAL(10,2) DEFAULT NULL,  
                    duration VARCHAR(100),
                    status ENUM('Open', 'Closed', 'Paused') DEFAULT 'Open',   
                    deadline DATE,            
                    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
                    );
                `);

                await connection.query(`
                    CREATE TABLE IF NOT EXISTS collage_student_request (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,  
                        college_code INT,                      
                        status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
                        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        approved_by INT DEFAULT NULL,       
                        approved_at TIMESTAMP DEFAULT NULL,
                        remarks TEXT DEFAULT NULL,        
                        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
                 );
             `)
 
                await connection.query(`
                    CREATE TABLE IF NOT EXISTS applications (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,
                        job_id INT NOT NULL,
                        resume_url VARCHAR(500),
                        cover_letter_url VARCHAR(500),
                        answer JSON, 
                        status ENUM('Applied', 'Under Review', 'Interview', 'Selected', 'Rejected') DEFAULT 'Applied',
                        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
                    );
                `)    

            
     
    console.log(" Database schema initialized");
    connection.release();
     } catch (error) {
         console.error(" Error initializing schema:", error);
     }
     
}


export default initSchema;