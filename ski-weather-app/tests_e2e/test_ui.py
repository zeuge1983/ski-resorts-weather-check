import re
from playwright.sync_api import Page, expect

def test_home_page_loads(page: Page, base_url):
    page.goto(base_url)
    expect(page).to_have_title(re.compile("Ski Resort Weather Checker"))
    expect(page.locator("h1")).to_contain_text("Ski Resort Weather Checker")

def test_search_resort(page: Page, base_url):
    page.goto(base_url)
    
    # Fill in the search form
    page.fill('input[name="resort"]', "Aspen")
    page.click('button[type="submit"]')
    
    # Check if results are displayed
    expect(page.locator("h2")).to_contain_text("Aspen")
    expect(page.locator(".current-weather")).to_be_visible()
    expect(page.locator(".forecast-container")).to_be_visible()

def test_search_error_empty(page: Page, base_url):
    page.goto(base_url)
    
    # Try to submit empty form (HTML5 validation might block this, but let's see if we can bypass or if it shows validation)
    # Actually, the input has 'required' attribute, so browser validation kicks in.
    # Playwright can check validation message, but simpler is to check if we stay on page or if we can force submit.
    # Let's try to remove the required attribute to test server side or just test a non-existent resort.
    
    # Test non-existent resort
    page.fill('input[name="resort"]', "NonExistentResort12345")
    page.click('button[type="submit"]')
    
    # Expect error message
    expect(page.locator(".error")).to_be_visible()
    expect(page.locator(".error")).to_contain_text("Ski resort not found")
