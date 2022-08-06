Feature: XML Test

 Scenario: Google Version Test
   * def response = read('browser.xml')
   * match /internet_browser/version contains '2'