function date_to_ISO (date) {
    const [day, month, year] = date.split(" ")
    const months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",")
    return new Date(year, months.indexOf(month), day).toISOString()
}

function Objective (record) {
    const date_set = date_to_ISO(record[2])
    const date_due = date_to_ISO(record[3])
    const set_time = new Date(date_set).getTime()
    const due_time = new Date(date_due).getTime()
    const today_time = new Date().getTime()
    const days_from_set = Math.floor((today_time - set_time) / (60*60*24*1000))
    const days_to_due = Math.floor((due_time - today_time) / (60*60*24*1000))
    
    record[2] = date_set
    record[3] = date_due

    this.name          = record[0]
    this.title         = record[1]
    this.setDate       = record[2]
    this.dueDate       = record[3]
    this.status        = record[4]
    this.coach         = record[5]
    this.objective     = record[6]
    this.days_from_set = days_from_set
    this.days_to_due   = days_to_due
    Objective.all.push(this)
}

Objective.all = []
Objective.topten = function () {
    return this.all
    .filter(obj => {
        return obj.days_to_due > -14 && obj.status === "In Progress"
            || obj.days_to_due > 0 && obj.status === "Complete"
    })
    .slice(0, 10)
    .sort((a, b) => a.days_to_due > b.days_to_due ? 1 : -1)
}

module.exports = Objective