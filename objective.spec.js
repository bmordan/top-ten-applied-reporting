const Objective = require("./objective")
const fixtures =   [
    [
    'Andrew Walker',
    'User stories',
    '08 Aug 2019',
    '08 Nov 2019',
    'Completed',
    'Bernard Mordan',
    'ANALYSIS: CAN UNDERSTAND AND CREATE BASIC ANALYSIS ARTEFACTS, SUCH AS USER CASES AND/OR USER STORIES\n' +
      '\n' +
      "I will create some users stories with my scrum master. We'll pick a feature and write some user cases/User stories for that feature. Add them to Jira. Then write this exercise up, tell us how useful you found it. Talk about why scrum does not use user stories.\n",
    "Dont need this"
  ],
  [
    'Kelly Ho',
    'Debugging',
    '07 Aug 2019',
    '13 Oct 2019',
    'Completed',
    'Bernard Mordan',
    'PROBLEM SOLVING: CAN APPLY STRUCTURED TECHNIQUES TO PROBLEM SOLVING, CAN DEBUG CODE AND CAN UNDERSTAND THE STRUCTURE OF PROGRAMMES IN ORDER TO IDENTIFY AND RESOLVE ISSUES\n' +
      '\n' +
      '2 Pieces of writing\n' +
      '\n' +
      '1) Write up the "the incident" show how you helped solve a problem/bug in a structured way (recreate, observed the system, made changes etc). WHAT did you do. WHO did you do it with. The result, what has changed. Use the STAR format\n' +
      '\n' +
      '2) How do you use debugger? Write about how you use console log? To debug code, where do you console log, what do you console. Use STAR\n',
    "Dont need this"
  ]
]

describe("Objective", () => {
    it("create an instance", () => {
        const andrew = new Objective(fixtures[0])
        const kelly = new Objective(fixtures[1])
        expect(andrew.name).toBe("Andrew Walker")
        expect(kelly.days_to_due).toBeLessThanOrEqual(0)
    })

    it("gathers all the objectives", () => {
        expect(Objective.all.length).toBe(2)
    })

    it("can get all the relevent objectives", () => {
        expect(Objective.objectives().length).toBe(0)
    })
})