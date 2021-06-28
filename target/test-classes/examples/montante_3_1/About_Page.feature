@smoke
Feature: PUP Website Testing

  Scenario: View About Page
    * configure driver = { type: 'msedgedriver', executable: 'src/test/java/examples/montante_3_1/msedgedriver.exe', webDriverSession: { capabilities: { browserName: 'edge' } } }
    * driver 'https://www.pup.edu.ph'
    And mouse().move('{a}About PUP').go()
    And click('{a}University Profile')
    Then waitForUrl('https://www.pup.edu.ph/about')