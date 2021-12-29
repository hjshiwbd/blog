const clog = console.log
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
// const domain = "http://t66y.com/";
const domain = "https://cl.2790x.xyz/";
const {
    pager
} = require('../utils/pager')

const conn = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    database: 'crawler',
    user: 'root',
    password: 'root'
})

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {});
});

router.post('/crawlerdata', function(req, res, next) {
    const {
        page,
        rows,
        keyword,
        fid
    } = req.body
    let sqlParam = []
    const keyword2 = keyword ? keyword.replace(' ', '%') : ""
    const like = keyword2 ? `and title like '%${keyword2}%'` : ""
    let fidSql = ""
    if (fid) {
        fidSql = `and fid in (?)`
        sqlParam.push(fid.split(','))
    }
    const p = pager(page, rows)
    const baseSql = `SELECT fid, title, concat('${domain}', link) link, author_name, post_date FROM \`t66y_article\` where 1 = 1 ${like} ${fidSql} order by post_date desc`
    const countSql = `select count(*) cc from (${baseSql}) tmp`
    const pageSql = `${baseSql} limit ${p.limit0},${p.pageSize}`
    const countQuery = conn.query(countSql, sqlParam, function(err, rows1) {
        const pageQuery = conn.query(pageSql, sqlParam, function(err, rows2) {
            res.json({
                rows: rows2,
                total: rows1[0].cc
            });
        })
        clog("page:", pageQuery.sql)
    })
    clog("count:", countQuery.sql)
});

router.post('/lastcrawlerdate', function(req, res, next) {
    const baseSql = ` select CONCAT('20', max(date)) dd, DATEDIFF(now(), STR_TO_DATE(CONCAT('20', max(date)),'%Y%m%d')) diff from crawler_queue;`
    const crawlQuery = conn.query(baseSql, {}, function(err, rows1) {
        res.json(rows1[0]);
    })
});

module.exports = router;