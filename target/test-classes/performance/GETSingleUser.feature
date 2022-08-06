Feature:Get Method for Single User API

  Background:
    * url 'https//reqres.in'

    Scenario:
      Given path 'api/users/2'
      When method GET
      Then status 200