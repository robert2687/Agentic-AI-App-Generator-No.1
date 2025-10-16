from playwright.sync_api import Page, expect

def test_app_loads(page: Page):
    """
    This test verifies that the main application page loads correctly.
    """
    print("Starting verification script...")
    # 1. Arrange: Go to the application's URL.
    page.goto("http://localhost:3000")

    # 2. Assert: Confirm the main content is visible.
    # We expect to see the main heading of the application.
    expect(page.get_by_role("heading", name="Agentic AI App Generator")).to_be_visible()

    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Verification script finished.")