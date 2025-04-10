from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from datetime import datetime
import time

def generate_unique_email():
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"john.doe{timestamp}@example.com"

PASSWORD = "SecurePass123"
driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

def click_and_verify(link_text, expected_url_part):
    try:
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, link_text))).click()
        print(f"➡️ Clicked on {link_text}")
        wait.until(EC.url_contains(expected_url_part))
        print(f"✅ Navigated to {expected_url_part}")
        time.sleep(2)
        dashboard_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Dashboard")))
        dashboard_link.click()
        wait.until(EC.url_contains("dashboard"))
        print("↩️ Returned to Dashboard")
        time.sleep(1)
    except Exception as e:
        print(f"❌ Failed on {link_text}: {e}")

try:
    # Home → Register
    driver.get("http://localhost:5173/")
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Welcome to PayNest')]")))
    print("✅ Home page loaded")
    time.sleep(2)
    register_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[@href='/register']")))
    register_button.click()
    print("🔁 Clicking Register...")
    wait.until(EC.url_contains("/register"))
    print("✅ Navigated to Register page")
    time.sleep(2)

    # Register Form (Step 1–3)
    email = generate_unique_email()
    wait.until(EC.presence_of_element_located((By.NAME, "firstName"))).send_keys("John")
    driver.find_element(By.NAME, "lastName").send_keys("Doe")
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.NAME, "confirmPassword").send_keys(PASSWORD)
    role_dropdown = Select(driver.find_element(By.NAME, "role"))
    role_dropdown.select_by_visible_text("Parent Account")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Next']"))).click()
    print("➡️ Step 1 completed")
    time.sleep(2)
    wait.until(EC.presence_of_element_located((By.NAME, "address"))).send_keys("123 Main Street, Manipal")
    driver.find_element(By.NAME, "phoneno").send_keys("9876543210")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Next']"))).click()
    print("➡️ Step 2 completed")
    time.sleep(2)
    wait.until(EC.presence_of_element_located((By.NAME, "poi"))).send_keys("DL-1234-5678")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Register')]"))).click()
    print("✅ Submitted registration form")
    time.sleep(2)
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Registration Successful')]")))
    print("🎉 Registration successful!")
    registered_username = driver.find_element(By.XPATH, "//strong").text
    print(f"👤 Returned Username: {registered_username}")
    time.sleep(10)

    # Login
    driver.get("http://localhost:5173/login")
    wait.until(EC.presence_of_element_located((By.NAME, "username"))).send_keys(registered_username)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]").click()
    print("🔐 Attempted login")
    welcome_element = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Welcome')]")))
    print(f"✅ Logged in successfully! {welcome_element.text}")

    # Header Navigation
    click_and_verify("Dashboard", "dashboard")
    wait.until(EC.element_to_be_clickable((By.ID, "accounts-dropdown"))).click()
    time.sleep(1)
    click_and_verify("Create Account", "accounts/create")
    wait.until(EC.element_to_be_clickable((By.ID, "transactions-dropdown"))).click()
    time.sleep(1)
    click_and_verify("Deposit", "transactions/deposit")
    wait.until(EC.element_to_be_clickable((By.ID, "transactions-dropdown"))).click()
    time.sleep(1)
    click_and_verify("Withdraw", "transactions/withdraw")
    wait.until(EC.element_to_be_clickable((By.ID, "transactions-dropdown"))).click()
    time.sleep(1)
    click_and_verify("Transfer", "transactions/transfer")
    wait.until(EC.element_to_be_clickable((By.ID, "transactions-dropdown"))).click()
    time.sleep(1)
    click_and_verify("History", "transactions/history")
    wait.until(EC.element_to_be_clickable((By.ID, "parent-dropdown"))).click()
    time.sleep(1)
    click_and_verify("Set Limits", "parent/set-limits")
    wait.until(EC.element_to_be_clickable((By.ID, "parent-dropdown"))).click()
    time.sleep(1)
    click_and_verify("Pending Approvals", "parent/pending-transactions")
    wait.until(EC.element_to_be_clickable((By.ID, "parent-dropdown"))).click()
    time.sleep(1)
    click_and_verify("Audit Logs", "parent/audit-logs")
    wait.until(EC.element_to_be_clickable((By.ID, "notifications-dropdown"))).click()
    print("🔔 Checked Notifications dropdown")
    time.sleep(2)
    wait.until(EC.element_to_be_clickable((By.ID, "user-dropdown"))).click()
    time.sleep(1)
    click_and_verify("Profile", "profile")

    # Dashboard Sidebar Tabs
    def click_tab(tab_text):
        try:
            tab = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, tab_text)))
            tab.click()
            print(f"✅ Clicked tab: {tab_text}")
            time.sleep(2)
        except Exception as e:
            print(f"❌ Tab click failed: {tab_text} | {e}")
            raise e  # Allow outer try/catch to work

    driver.get("http://localhost:5173/dashboard")
    wait.until(EC.presence_of_element_located((By.LINK_TEXT, "My Accounts")))

    click_tab("My Accounts")
    click_tab("Transaction History")
    try:
        click_tab("Pending Approvals")
    except:
        print("ℹ️ Skipping 'Pending Approvals' (not visible for this user)")
    try:
        click_tab("Audit Logs")
    except:
        print("ℹ️ Skipping 'Audit Logs' (not visible for this user)")
    click_tab("My Accounts")

    # Click 'Create Account' button
    try:
        create_account_btn = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Create Account")))
        create_account_btn.click()
    except:
        driver.get("http://localhost:5173/accounts/create")

    wait.until(EC.url_contains("accounts/create"))
    print("🧾 On Create Account page")
    wait.until(EC.presence_of_element_located((By.NAME, "accountName"))).send_keys("Selenium Auto Account")
    driver.find_element(By.NAME, "accountType").send_keys("SAVINGS")
    driver.find_element(By.NAME, "balance").send_keys("500")
    driver.find_element(By.NAME, "description").send_keys("Created via Selenium test")
    driver.find_element(By.XPATH, "//button[contains(text(),'Create Account')]").click()
    print("📤 Submitted account creation form")
    wait.until(EC.url_contains("/dashboard"))
    print("🎉 Successfully returned to dashboard after account creation")
    details_button = wait.until(EC.presence_of_element_located((By.XPATH, "//a[contains(text(), 'Details')]")))
    account_details_url = details_button.get_attribute("href")
    account_id = account_details_url.split("/")[-1]
    print(f"🔍 Found account ID: {account_id}")

    details_button.click()
    print("➡️ Navigated to Account Details")
    time.sleep(2)

    # STEP 3: Back to Dashboard
    driver.get("http://localhost:5173/dashboard")
    wait.until(EC.presence_of_element_located((By.LINK_TEXT, "My Accounts")))
    print("↩️ Returned to Dashboard")

    # STEP 4: Deposit $500
    deposit_url = f"http://localhost:5173/transactions/deposit?accountId={account_id}"
    driver.get(deposit_url)
    wait.until(EC.url_contains("deposit"))
    print("💰 On Deposit Page")

    wait.until(EC.presence_of_element_located((By.NAME, "amount"))).send_keys("500")
    driver.find_element(By.NAME, "description").send_keys("Selenium Deposit Test")
    driver.find_element(By.XPATH, "//button[contains(text(), 'Deposit Funds')]").click()
    print("✅ Deposit submitted")

    wait.until(EC.url_contains("/dashboard"))
    print("↩️ Returned to Dashboard after deposit")
    time.sleep(3)

    # STEP 5: Withdraw $500
    withdraw_url = f"http://localhost:5173/transactions/withdraw?accountId={account_id}"
    driver.get(withdraw_url)
    wait.until(EC.url_contains("withdraw"))
    print("💸 On Withdraw Page")
    wait.until(EC.presence_of_element_located((By.NAME, "amount"))).send_keys("500")
    driver.find_element(By.NAME, "description").send_keys("Selenium Withdrawal Test")
    driver.find_element(By.XPATH, "//button[contains(text(), 'Withdraw Funds')]").click()
    print("✅ Withdrawal submitted")

    wait.until(EC.url_contains("/dashboard"))
    print("↩️ Returned to Dashboard after withdrawal")
    time.sleep(3)
except Exception as e:
    print(f"❌ Error during test: {e}")

finally:
    time.sleep(5)
    driver.quit()
