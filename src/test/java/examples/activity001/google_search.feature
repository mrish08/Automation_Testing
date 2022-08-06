@smoke
Feature: Search in Google

#  Scenario: Karate Search
#    #* configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
#    Given configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
#    And driver 'https://www.google.com/'
#    And input('input[name=q]', 'karate dsl')
#    When click('input[name=btnI]')
#    Then waitForUrl('https://github.com/intuit/karate')
#
#  Scenario: Facebook Search
#    #* configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
#    Given configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
#    And driver 'https://www.google.com/'
#    And input('input[name=q]', 'fb')
#    When click('input[name=btnI]')
#    Then waitForUrl('https://www.facebook.com/')

  @tagsearch @ignore
  Scenario Outline: Using different searches - <name>
    Given def step0 = 'Using Chrome as a browser'
    * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    #* configure driver = {type: 'chrome'}
    And def step1 = 'Browser navigates to Google'
    * driver 'https://www.google.com/'
    And def step2 = 'User input text search'
    * input('input[name=q]', '<value>')
    When def step3 = 'User click button'
    * click('input[name=btnI]')
    Then def step4 = 'User expected result should match'
    * driver.title() contains '<expected>'


    Examples:
      | read ('google_search.csv')|


    Scenario: Pup Home Search
      Given def step0 = 'Using Chrome as a browser'
      * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
      * driver 'https://www.pup.edu.ph/'
      * driver.maximize()
      * waitUntil("document.readyState == 'complete'")
      * click('.services-widget')
      * click('{^a}Applicant')
      * driver.screenshot()
      * input('#txtSearch', 'quezon city')
      * click('#btnSearch')
      * waitFor('.table')
      * screenshot()
      * clear('#txtSearch1')
      * input('#txtSearch1', 'open university')
      * click('.btn.btn-system.btn-flat')
      * match text('.table') contains 'DENR, PUP'
      * screenshot()

