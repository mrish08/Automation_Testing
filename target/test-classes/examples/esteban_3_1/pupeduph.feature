@smoke
Feature: Search in Google

Scenario Outline: Testing Search Feature in PUP Site - <name>

Given def step1 = 'Using Chrome as a browser'
    * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    And def step2 = 'Browser Navigates to PUP search website'
    * driver 'https://www.pup.edu.ph/'
    And def step3 = 'Maximize Browser'
    * driver.maximize()
    And def step4 = 'wait til complete'
    * waitUntil("document.readyState == 'complete'")
    * click('.services-widget')
    And def step5 = 'User click Applicant Button'
    * click('{^a}Applicant')
    * driver.screenshot()
    And def step6 = 'User input text search'
    * input('#txtSearch', 'BSIT')
    When def step7 = 'User click search button'
    * click('#btnSearch')
    Then def step8 = 'User expected results should be displayed in the website'
    * waitFor('.table')
    * screenshot()


    Examples:
      | read ('pup_test.csv')|