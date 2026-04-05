import mysql from 'mysql2/promise';

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hms_db'
  });

  try {
    const [rows] = await pool.query('SELECT AdminID, FullName, Role FROM Admin LIMIT 1');
    console.log(rows);
  } catch (e) {
    console.error("DB ERROR: ", e);
  } finally {
    pool.end();
  }
}
test();
