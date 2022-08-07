@smoke
Feature: View Downloadable Forms
  Scenario Outline: View PUP Downloadable Forms - <name>
    Given def step0 = 'Using Chrome as a browser'
    * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    And def step1 = 'Browser navigates to PUP search website'
    * driver 'https://www.pup.edu.ph'
    And def step2 = 'Maximize Browser'
    * maximize()
    And def step3 = 'User click services modal'
    * click('.services-widget')
    And def step4 = 'User click Faculty Member or Employee button'
    * click('{^a}Faculty Member or Employee')
    And click('<btn1>')
    Then waitForUrl('<expected>')

    Examples:
      | name                               | btn1                      | expected
      | Downloads for Faculty and Employees| {a}Downloadable Forms     | https://www.pup.edu.ph/downloads/employees/       |
