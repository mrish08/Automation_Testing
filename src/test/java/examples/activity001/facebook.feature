@smoke
Feature: Karate Search

  Scenario: Google Chrome
    * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    * driver 'https://www.google.com/'
    And input('input[name=q]', 'karate dsl')
    When click('input[name=btnI]')
    Then waitForUrl('https://github.com/intuit/karate')
