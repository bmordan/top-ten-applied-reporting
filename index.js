require('dotenv').config()
const {EMAIL, GMAIL_PASSWORD, APPLIED_PASSWORD, NODE_ENV} = process.env
const puppeteer = require('puppeteer-core')
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')
const pug = require('pug')
const CronJob = require('cron').CronJob
const {exec} = require('child_process')
const Objective = require('./objective')
const reportsDir = path.resolve(__dirname, 'reports')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
            user: EMAIL,
            pass: GMAIL_PASSWORD
        }
})
const schedule = '01 * * * *'
// '0 9 * * 1-5' “At 09:00 on every day-of-week from Monday through Friday.” https://crontab.guru/#0_9_*_*_1-5
// GMAIL_PASSWORD is an app password https://support.google.com/accounts/answer/185833

async function go() {
    console.log(`starting cron job at ${new Date().toISOString()}`)
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: NODE_ENV === 'development' 
            ? '/Applications/Chromium.app/Contents/MacOS/Chromium' 
            : '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setCacheEnabled(false)
    await page.goto("https://applied.whitehat.org.uk/login/index.php")
    await page.type("#username", EMAIL)
    await page.type("#password", APPLIED_PASSWORD)
    await page.click("#loginbtn")
    await page.waitFor("#page-totara-dashboard-8")
    await page.click(`a[href="https://applied.whitehat.org.uk/totara/reportbuilder/report.php?id=115"]`)
    await page.waitFor("#id_export")
    await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.resolve(__dirname, 'reports') })
    await page.click("#id_export")
    setTimeout(function () {
        browser.close()
        exec(`mv ${reportsDir}/objectives_for_coach_dashboard_report.* ${reportsDir}/objectives_for_coach_dashboard_report.csv`, readcsv)
    }, 2000)
}

async function readcsv () {
    const stream = parse({delimiter: ','})
    stream.on('readable', function () {
        let headers
        while(record = stream.read()) {
            if(!headers) { headers = record }
            else { new Objective(record) }
        }
    })
    stream.on('error', function(err) { console.error(err.message) })
    stream.on('end', sendReport)
    fs.createReadStream(path.resolve(reportsDir, 'objectives_for_coach_dashboard_report.csv')).pipe(stream)
}

const sendReport = () => {
    const email = {
        from: EMAIL,
        to: EMAIL,
        subject: `Objectives report for ${new Date().toGMTString().substring(0,17)}`,
        html: pug.renderFile(path.join(__dirname, 'email.pug'), {objectives: Objective.objectives()})
    }

    transporter.sendMail(email, (err, info) => {
        console.log(err || info)
        Objective.all = []
    })
}

console.log(`setting top-ten-appied-reporting to cron at ${schedule}`)
new CronJob(schedule, go, null, true)
