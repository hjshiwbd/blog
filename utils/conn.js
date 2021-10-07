const mysql = require('mysql');

export const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'crawler',
    port: 3306
});