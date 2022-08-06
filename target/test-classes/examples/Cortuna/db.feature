Feature: DB Feature

  Scenario:
    * def config = { username: '', password: '', url: 'jdbc:sqlserver://ACER\\CLAIRE;databasename=karate_db;integratedSecurity=true;', driverClassName: 'com.microsoft.sqlserver.jdbc.SQLServerDriver' }
    * def DbUtils = Java.type('src.test.java.examples.activity001.DbUtils')
    * def db = new DbUtils(config)

    * def address = db.readRows('select Address from tbl_Address')
    * match address contains { Address: '123'  }
    * print address