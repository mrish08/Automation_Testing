@smoke_qa

Feature: IDS QA - ALIRtS

  Scenario: IDS QA in Chrome
    * def CoreAction = Java.type('examples.users.CoreActions')
    * def action = new CoreAction()
    * def browser = action.openBrowser('https://idsportal-qa.rs.lexisnexis.net/idslogin/')
    * def step2 = "Login page display"