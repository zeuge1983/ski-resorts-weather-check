import pytest
import os

@pytest.fixture(scope="session")
def base_url():
    port = os.getenv("PORT", "12000")
    return f"http://localhost:{port}"
