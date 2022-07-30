package examples.users;

import org.junit.jupiter.engine.Constants;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.*;

import java.net.MalformedURLException;
import java.net.URL;


public class CoreActions {

    public CoreActions() {
        System.out.println("Starting");
    }
    WebDriver driver;

    public void openBrowser(String surl) throws MalformedURLException {
        System.out.println("Navigate Login Page");
        ChromeOptions chromeOptions = new ChromeOptions();
        //chromeOptions.addArguments("--headless");
        driver = new RemoteWebDriver(new URL("http://localhost:4444/wd/hub"), chromeOptions);
        driver.get(surl);
    }

    public String getPageTitle() throws Exception
    {
        String pageTitle = "";
        try {

            pageTitle = driver.getTitle();

        } catch (Exception e) {
            System.out.println("Print this.");
        }
        return pageTitle;


    }
}
