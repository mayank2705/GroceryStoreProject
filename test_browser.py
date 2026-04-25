import pytest
from playwright.sync_api import sync_playwright

# Since the frontend will be served somehow (or we can just test if the dev server works), 
# we need the URL. Assume it runs on http://localhost:5173
BASE_URL = "http://localhost:5173"

@pytest.fixture(scope="session")
def browser_context():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        yield context
        browser.close()

def test_home_page_loads(browser_context):
    page = browser_context.new_page()
    response = page.goto(f"{BASE_URL}/")
    assert response.status == 200
    assert "Mohit Store" in page.content() or "Loading" in page.content()
    page.close()

def test_orders_page_loads(browser_context):
    page = browser_context.new_page()
    response = page.goto(f"{BASE_URL}/orders")
    # Will redirect to /login or show login page if not authenticated, that's fine as long as it loads
    assert response.status in [200, 304] 
    page.close()

def test_admin_dashboard_loads(browser_context):
    page = browser_context.new_page()
    response = page.goto(f"{BASE_URL}/admin")
    assert response.status in [200, 304]
    page.close()

def test_static_pages(browser_context):
    page = browser_context.new_page()
    for route in ["/about", "/privacy-policy", "/terms-of-use", "/return-policy"]:
        response = page.goto(f"{BASE_URL}{route}")
        assert response.status in [200, 304]
    page.close()
