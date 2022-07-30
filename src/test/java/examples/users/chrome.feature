@smoke_qa

Feature: IDS QA - ALIRtS

  @tag1 @ignore
  Scenario: IDS QA - Selenium Chrome
    * def CoreAction = Java.type('examples.users.CoreActions')
    * def action = new CoreAction()
    * def browser = action.openBrowser('https://idsportal-qa.rs.lexisnexis.net/idslogin/')
    * def step2 = "Login page display"
    * def title1 = action.getPageTitle()
    * match title1 contains "Insurance Solutions"

  @tag2
  Scenario: IDS QA - Karate only
    Given def step0 = "Preparing pre-requisite for testing"
    * configure driver = { type: 'chromedriver', start: false, webDriverUrl: 'http://localhost:4444/wd/hub'}
    And def step1 = "Navigates to IDS QA portal login"
     * driver 'https://idsportal-qa.rs.lexisnexis.net/idslogin'
     * waitUntil("document.readyState == 'complete'")
    And def step2 = "Browser maximize"
     * driver.maximize()
    Then def step3 = "Verify the page title contains Insurance Solutions"
    * match driver.title contains 'Insurance Solutions'
    When def step4 = "Input userid in userid textbox"
    #* click('#body-login-input')
    * driver.input("//input[@name='userId']", 'CortCl01@risk')
    * screenshot()
    #if fail delete from here
    * driver.click("//button[@id='body-next-button']")
    * driver.input("//input[@id='body-login-input']", 'Blessed99')
    * driver.click("//button[@id='body-next-button']")
    * driver.waitUntil("document.readyState == 'complete'")
    * driver.screenshot()
    * driver.waitUntil("document.readyState == 'complete'")
    * driver.screenshot()
    * driver.waitUntil("document.readyState == 'complete'")
    #* waitForUrl('https://idsportal-qa.rs.lexisnexis.net/idslogin/portals')
    * click("//a[@href='/idslogin/ssoportal/Alirts']")
    * driver.screenshot()
#    * waitUntil("document.readyState == 'complete'")
#    * waitForUrl('https://alawqpnc301.noam.lnrm.net/DMVPagesCore/Home/Loggedin')
    * click("//i[@class='fas fa-sign-out-alt']")
#    * def stepFinal = "Finally Sign-out"

  @tag3 @ignore
  Scenario: IDS QA - Session Key
    Given def step0 = "Preparing pre-requisite for testing"
    * configure driver = { type: 'chromedriver', start: false, webDriverUrl: 'http://localhost:4444/wd/hub'}
    And def step1 = "Navigates to IDS QA portal login"
    * driver 'https://alawqpnc301.noam.lnrm.net/DMVPagescore?skey=477AC822-9744-4452-9C64-0075A16EB3EB'
    * driver.maximize()
    * driver.screenshot()
    * driver.click('{}Policy Search')
    * driver.waitForUrl('https://alawqpnc301.noam.lnrm.net/DMVPagescore/Policy/Index')
    * driver.screenshot()

  @tag4 @ignore
  Scenario: IDS QA - Title Page
    Given def step0 = "Preparing pre-requisite for testing"
    * configure driver = { type: 'chromedriver', start: false, webDriverUrl: 'http://localhost:4444/wd/hub'}
    And def step1 = "Navigates to IDS QA portal login"
    * driver 'https://idsportal-qa.rs.lexisnexis.net/idslogin'
    * waitUntil("document.readyState == 'complete'")
    And def step2 = "Browser maximize"
    * driver.maximize()
    Then def step3 = "Verify the page title contains Insurance Solutions"
    * match driver.title contains 'Insurance Solutions'





