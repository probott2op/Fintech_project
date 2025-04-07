from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from selenium.webdriver.support.ui import Select

# Optional: Path to your chromedriver if not in PATH
# service = Service(executable_path="/path/to/chromedriver")
# driver = webdriver.Chrome(service=service)

driver = webdriver.Chrome()  # Make sure chromedriver is in your PATH
driver.get("http://localhost:5173/")
time.sleep(3)
try:
    wait = WebDriverWait(driver, 10)
    
    # Wait for hero section text to ensure home page is loaded
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Welcome to PayNest')]")))
    print("✅ Home page loaded")

    # Click the "Register" button (via the Link)
    register_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[@href='/register']")))
    register_button.click()
    print("🔁 Clicking Register...")

    # Wait for the Register page to load
    wait.until(EC.url_contains("/register"))
    print("✅ Navigated to Register page!")
    time.sleep(3) 
    # Fill first name
    wait.until(EC.presence_of_element_located((By.NAME, "firstName"))).send_keys("John")

    # Fill last name
    driver.find_element(By.NAME, "lastName").send_keys("Doe")

    # Fill email
    driver.find_element(By.NAME, "email").send_keys("john.doe@example.com")

    # Fill password and confirm
    driver.find_element(By.NAME, "password").send_keys("SecurePass123")
    driver.find_element(By.NAME, "confirmPassword").send_keys("SecurePass123")

    # Select "Parent Account" from dropdown
    dropdown_element = driver.find_element(By.NAME, "role")
    dropdown = Select(dropdown_element)
    dropdown.select_by_visible_text("Parent Account")

    # Submit the form
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    driver.execute_script("arguments[0].scrollIntoView(true);", submit_button)
    time.sleep(0.5)
    submit_button.click()

    # Wait for redirect or success message
    time.sleep(3)  # Adjust based on how long your redirect takes
    print("✅ Form submitted successfully.")
    

    # Optional: Screenshot
    #driver.save_screenshot("register_page.png")

except Exception as e:
    print(f"❌ Error during test: {e}")

finally:
    time.sleep(2)
    driver.quit()
