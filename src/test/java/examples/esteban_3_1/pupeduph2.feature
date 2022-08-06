@smoke
Feature: Search in Google

Scenario Outline: Using navigation bar of PUP Site - <name>

Given def step1 = 'Using Chrome as a browser'
    * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    And def step2 = 'Browser Navigates to PUP website'
    * driver 'https://www.pup.edu.ph/'
    And def step3 = 'Maximize Browser'
    * driver.maximize()
    And def step4 = 'Wait the document until complete'
    * waitUntil("document.readyState == 'complete'")
    And def step5 = 'User clicks the navigation bar'
    * click('.navbar')
    And def step6 = 'User clicks About option'
    * click('{^a}About PUP')
    And def step7 = 'User clicks dropdown'
    * click('.dropdown')
    And def step8 = 'User click Logo and Symbols under dropdown options'
    * click('{^a}Logo and Symbols')
    When def step9 = 'User clicks Academic option in Navigation Bar'
    * click('{^a}Academic')
    Then def step10 = 'User clicks Graduate Studies under Academic dropdown navigation'
    * click('{^a}Graduate Studies')


    Examples:
      | read ('pup_test.csv')|