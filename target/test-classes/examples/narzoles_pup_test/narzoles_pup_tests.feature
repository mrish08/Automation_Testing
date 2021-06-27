@smoke
Feature: PUP Website Navigations

  Scenario: PUP QC Contact Information
    * configure driver = {type:'safaridriver', executable:'/usr/bin/safaridriver'}
    * driver 'https://www.pup.edu.ph/'
    * driver.maximize()
    And waitFor("{^a}Branches and Campuses")
    And mouse().move("{^a}Branches and Campuses").go()
    * delay(1500)
    And highlight("{ul/li/a}Quezon City").click()
    Then waitForUrl('https://www.pup.edu.ph/quezoncity/')
    * delay(3000)
    And highlight("{^a}Contact Information").click()
    Then waitForUrl('https://www.pup.edu.ph/quezoncity/contactinfo')
    * delay(3000)


  Scenario: PUP News
    * configure driver = {type:'safaridriver', executable:'/usr/bin/safaridriver'}
    * driver 'https://www.pup.edu.ph/'
    * driver.maximize()
    And waitFor("section.box-article-list > header > h2 > a")
    And scroll("section.box-article-list > header > h2 > a")
    * delay(3000)
    And highlight("section.box-article-list > header > h2 > a")
    And click("section.box-article-list > header > h2 > a")
    Then waitForUrl('https://www.pup.edu.ph/news/')
    * delay(3000)