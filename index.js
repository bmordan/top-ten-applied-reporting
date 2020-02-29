require('dotenv').config()
const {EMAIL, GMAIL_PASSWORD, APPLIED_PASSWORD} = process.env
const puppeteer = require("puppeteer")
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require("path")
const parse = require("csv-parse")
const pug = require("pug")
const sqlite3 = require('sqlite3').verbose()
const {exec} = require("child_process")
const db = new sqlite3.Database(':memory:')
const reportsDir = path.resolve(__dirname, 'reports')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
            user: EMAIL,
            pass: GMAIL_PASSWORD
        }
})
// GMAIL_PASSWORD is an app password https://support.google.com/accounts/answer/185833

async function go() {
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.setCacheEnabled(false)
    await page.goto("https://applied.whitehat.org.uk/login/index.php")
    await page.type("#username", EMAIL)
    await page.type("#password", APPLIED_PASSWORD)
    await page.click("#loginbtn")
    await page.waitFor("#page-totara-dashboard-8")
    await page.click(`a[href="https://applied.whitehat.org.uk/totara/reportbuilder/report.php?id=115"]`)
    await page.waitFor("#id_export")
    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.resolve(__dirname, 'reports')
    })
    await page.click("#id_export")
    setTimeout(function () {
        browser.close()
        exec(`mv ${reportsDir}/objectives_for_coach_dashboard_report.* ${reportsDir}/objectives_for_coach_dashboard_report.csv`, readcsv)
    }, 2000)
}

function date_to_ISO (date) {
    const [day, month, year] = date.split(" ")
    const months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",")
    return new Date(year, months.indexOf(month), day).toISOString()
}

async function readcsv () {
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS objectives (id INTEGER PRIMARY KEY, name TEXT, title TEXT, date_set TEXT, date_due TEXT, status TEXT, coach TEXT, discription TEXT, days_from_set INTEGER, days_to_due INTEGER);")
        const src = path.resolve(reportsDir, 'objectives_for_coach_dashboard_report.csv')
        const stream = parse({delimiter: ','})
        const insert = db.prepare("INSERT INTO objectives (name, title, date_set, date_due, status, coach, discription, days_from_set, days_to_due) VALUES (?,?,?,?,?,?,?,?,?);")
        const query = `SELECT name, title, status, days_to_due FROM objectives WHERE status IS "In Progress" AND days_to_due > -14 OR status IS "Complete" AND days_to_due > 0  ORDER BY days_to_due, name LIMIT 10;`
        stream.on('readable', function () {
            let headers
            while(record = stream.read()) {
                if(!headers) { headers = record }
                else {
                    const date_set = date_to_ISO(record[2])
                    const date_due = date_to_ISO(record[3])
                    const set_time = new Date(date_set).getTime()
                    const due_time = new Date(date_due).getTime()
                    const today_time = new Date().getTime()
                    const days_from_set = Math.floor((today_time - set_time) / (60*60*24*1000))
                    const days_to_due = Math.floor((due_time - today_time) / (60*60*24*1000))
                    record[2] = date_set
                    record[3] = date_due
                    insert.run([...record.slice(0,-1), days_from_set, days_to_due])
                }
            }
        })
        stream.on('error', function(err){
            console.error(err.message)
        })
        stream.on('end', function () {
            stream.end()
            insert.finalize()
            db.all(query, function (err, rows) {
                if (err) { return console.error(err) }
                sendReport(rows)
            })
            db.close()
        })
        fs.createReadStream(src).pipe(stream)
    })
}

const sendReport = rows => {
    const report = {
        from: EMAIL,
        to: EMAIL,
        subject: `Objectives report for ${new Date().toGMTString().substring(0,17)}`,
        html: pug.renderFile(path.join(__dirname, 'email.pug'), {data: rows})
    }

    transporter.sendMail(report, (err, info) => {
        console.log(err || info)
    })
}

go()
