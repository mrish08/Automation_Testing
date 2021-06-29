@smoke
Feature: PUP_Website

  Scenario Outline: Open PUP <name>
    * configure driver = {type:'chrome', executable: 'C:/Program Files/Google/Chrome/Application/chrome.exe'}
    * driver 'https://www.pup.edu.ph/'
    And click('<btn1>')
    When click('<btn2>')
    Then waitForUrl('<expected>')

    Examples:
      | name             | btn1                     | btn2             | expected                   |
      | Bookstore page   | {a}Students              | {a}PUP Bookstore | www.pup.edu.ph/bookstore/  |
      | Quezon City page | {a}Branches and Campuses | {a}Quezon City   | www.pup.edu.ph/quezoncity/ |