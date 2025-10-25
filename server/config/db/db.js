import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: process.env.DB_PASS,   
  database: 'campusconnect',       
  port: 3306
});

console.log('Connected to MySQL database');

export default pool;

  