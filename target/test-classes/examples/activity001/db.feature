Feature: DB Feature

  Scenario:
    * def config = { username: '', password: '', url: 'jdbc:sqlserver://ACER;databasename=karate_db;integratedSecurity=true;', driverClassName: 'com.microsoft.sqlserver.jdbc.SQLServerDriver' }
    * def DbUtils = Java.type('examples.activity001.DbUtils')
    * def db = new DbUtils(config)

    * def address = db.readRows('select Address from tbl_address')
    * match address contains { Address: '123'  }
    * print address