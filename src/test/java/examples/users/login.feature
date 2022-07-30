Feature: Login

  @tag1 @ignore
  Scenario: Login - Selenium Chrome
    * def CoreAction = Java.type('examples.users.CoreActions')
    * def action = new CoreAction()
    * def browser = action.openBrowser('http://www.executeautomation.com/demosite/Login.html')
    * def step2 = "Login page display"
    * def title1 = action.getPageTitle()
    * match title1 contains "Execute Automation"

  Scenario: Login - Karate only
    Given def step0 = "Preparing pre-requisite for testing"
    * configure driver = { type: 'chromedriver', start: false, webDriverUrl: 'http://localhost:4444/wd/hub'}
    And def step1 = "Navigates to IDS QA portal login"
    * driver 'http://www.executeautomation.com/demosite/Login.html'
    * match driver.title contains "Execute Automation"
    * input("//input[@name='UserName']", 'admin')
    * input("//input[@name='Password']", 'admin')
    * click("//input[@name='Login']")
    * click("//input[@name='Save']")
    * match html("//h1") == '<h1>Execute Automation Selenium Test Site</h1>'
    * match driver.title contains "Execute Automation"
    * driver.quit()

