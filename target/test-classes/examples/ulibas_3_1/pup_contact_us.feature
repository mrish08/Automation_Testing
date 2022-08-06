@smoke
Feature: Contact us in PUP

 Scenario Outline: Contact us Feature in PUP Site - <name>
   Given def step0 = 'Using Chrome as a browser'
    * configure driver = {type:'chromedriver', executable: 'C:/Program Files/Google/Chrome/Application/chromedriver.exe'}
    And def step1 = 'Browser navigates to PUP search website'
    * driver 'https://www.pup.edu.ph'
    And def step2 = 'Maximize Browser'
    * driver.maximize()
    And def step3 = 'Wait the document until complete'
    * waitUntil("document.readyState == 'complete'")
    And def step4 = 'User click Applicant button'
    * click('{^a}Applicant')
    When def step5 = 'User click Contact us'
    * click('{^a}Contact us')
    Then def step6 = 'User expected result should display the output in the website'
    * waitForUrl('https://www.pup.edu.ph/about/contactus')

    Examples:
          | read ('pup_contact_us.csv')|