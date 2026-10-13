
const pool = require("./db");

async function testConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        console.log("MySQL 连接成功！");
        console.log(rows);
    } catch (error) {
        console.error("MySQL 连接失败：", error.message);
    } finally {
        await pool.end();
    }
}

testConnection();