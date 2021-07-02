@smoke
Feature: PUP_Website

  Scenario Outline: Academic - PUP Website <name>
    * configure driver = {type:'chrome', executable: 'C:/Program Files/Google/Chrome/Application/chrome.exe'}
    * driver 'https://www.pup.edu.ph/'
    And click('<link1>')
    When click('<link2>')
    Then waitForUrl('<expected>')

    Examples:
      | name                 | link1       | link2                   | expected                                            |
      | Graduate Studies     | {a}Academic | {a}Graduate Studies     | https://www.pup.edu.ph/academic/graduatestudies     |
      | Colleges             | {a}Academic | {a}Colleges             | https://www.pup.edu.ph/academic/colleges            |
      | Academic Programs    | {a}Academic | {a}Academic Programs    | https://www.pup.edu.ph/academic/programs            |
      | University Registrar | {a}Students | {a}University Registrar | https://www.pup.edu.ph/studentservices/registrar/   |
      | Student Publications | {a}Students | {a}Publications         | https://www.pup.edu.ph/studentservices/publications |