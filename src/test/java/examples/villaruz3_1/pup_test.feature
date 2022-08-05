@smoke
Feature: PUP_Website

  Scenario Outline: Research - PUP Website <name>
    * configure driver = {type:'chrome', executable: 'C:/Program Files/Google/Chrome/Application/chrome.exe'}
    * driver 'https://www.pup.edu.ph/'
    And click('<link1>')
    When click('<link2>')
    Then waitForUrl('<expected>')

    Examples:
      | name           | link1         | link2             | expected                                 |
      | Researches     | {a}Researches | {a}Researches     | https://www.pup.edu.ph/research/rmo/     |
      | Extensions     | {a}Researches | {a}Extensions     | https://www.pup.edu.ph/research/emo/     |