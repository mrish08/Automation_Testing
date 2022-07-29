package examples.users;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.*;

import java.net.MalformedURLException;
import java.net.URL;


public class CoreActions {

    public CoreActions() {
        System.out.println("Starting");
    }

    public void openBrowser(String surl) throws MalformedURLException {
        System.out.println("Navigate Login Page");
        ChromeOptions chromeOptions = new ChromeOptions();
        chromeOptions.addArguments("--headless");
        WebDriver driver = new RemoteWebDriver(new URL("http://localhost:4444/wd/hub"), chromeOptions);
        driver.get(surl);
    }
}
