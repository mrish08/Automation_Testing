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

  Scenario Outline: Using <name>e
    Given configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    And driver 'https://www.google.com/'
    And input('input[name=q]', '<value>')
    When click('input[name=btn2]')
    Then waitForUrl('<expected>')

    Examples:
      | read ('google_search.csv')|