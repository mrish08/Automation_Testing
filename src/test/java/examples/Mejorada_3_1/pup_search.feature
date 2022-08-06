@smoke
Feature: Search in PUP
  Scenario Outline: Using PUP search bar - <name>
    Given def step0 = 'Using Chrome as a browser'
    * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    #* configure driver = {type: 'chrome'}
    And def step1 = 'Browser navigates to PUP search website'
    * driver 'https://www.pup.edu.ph'
    And def step2 = 'Maximize Browser'
    * maximize()
    And def step3 = 'User click services modal'
    * click('.services-widget')
    And def step4 = 'User click Student button'
    * click('{^a}Student')
    And def step5 = 'Take screenshot'
    * driver.screenshot()
    And def step6 = 'Clear input field'
    * clear('#txtSearch')
    And def step7 = 'User search for student'
    * input('#txtSearch', '<value>')
    And def step8 = 'User click button'
    * click("//a[@id='btnSearch']")
    And def step9 = 'Wait for the table to load'
    * waitFor('.table')
    And def step10 = 'Take screenshot'
    * driver.screenshot()
    And def step11 = 'Clear Input Field'
    * clear('#txtSearch1')
    And def step12 = 'User input text search'
    * input('#txtSearch1', '<value1>')
    When def step13 = 'User click button'
    * click('.btn.btn-system.btn-flat')
    Then def step14 = 'User expected result should display the output in the table'
    * match text('.table') contains '<value1>'
    * waitUntil("document.readyState == 'complete'")
    * driver.screenshot()

    Examples:
      | read ('pup_search.csv')|