@smoke
Feature: View Academic Year
  Scenario Outline: View PUP Academic Year 2022-2023 - <name>
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
    And click('<btn2>')
    Then waitForUrl('<expected>')

    Examples:
      | name                               | btn2                               | expected
      | Downloads for Faculty and Employees| {a}View Academic Year 2022-2023    | https://www.pup.edu.ph/about/calendar       |
