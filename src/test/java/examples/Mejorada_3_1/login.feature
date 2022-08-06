@smoke
Feature: Redirecting to PUP Appointment System and login
  Scenario Outline: Using PUP Appointment System Login- <name>
    Given def step0 = 'Using Chrome as a browser'
    * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    #* configure driver = {type: 'chrome'}
    And def step1 = 'Browser navigates to PUP search website'
    * driver 'https://www.pup.edu.ph'
    And def step2 = 'Maximize Browser'
    * maximize()
    And def step3 = 'User click services modal'
    * click('.services-widget')
    And def step4 = 'User click Applicant button'
    * click('{^a}Applicant')
    And def step5 = 'Take Screenshot'
    * driver.screenshot()
    And def step6 = 'User waiting time'
    * waitUntil("document.readyState == 'complete'")
    And def step7 = 'User click appointment'
    * click("//span[contains(text(),'Schedule an appointment prior to visiting the Univ')]")
    And def step8 = 'User waiting time'
    * waitUntil("document.readyState == 'complete'")
    And def step8 = 'User click student login button'
    * click("//a[contains(@class,'btn-block bg-danger')]")
    And def step9 = 'Clear waiting time'
    * waitUntil("document.readyState == 'complete'")
    And def step10 = 'Clear Fields'
    * clear('#studno')
    * clear('#SelectMonth')
    * clear('#SelectDay')
    * clear('#SelectYear')
    * clear('#password')
    And def step11 = 'Take screenshot'
    * driver.screenshot()
    And def step12 = 'User waiting time'
    * waitUntil("document.readyState == 'complete'")
    And def step13 = 'User input details'
    * input('#studno', '<number>')
    * select('#SelectMonth','<month>')
    * select('#SelectDay','<day>')
    * select('#SelectYear','<year>')
    * input('#password','<password>')
    And def step14 = 'Take screenshot'
    * driver.screenshot()
    When def step15 = 'User waiting time'
    * waitUntil("document.readyState == 'complete'")
    Then def step16 = 'User click login button'
    * click("//input[@name='Login']")
    * driver.screenshot()

    Examples:
      | read ('login.csv')|
