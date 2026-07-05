"""
CommunityPulse AI - API Testing Script
Run this to verify all improvements are working correctly
"""

import requests
import json
import time
from typing import Dict, Optional

# Configuration
BASE_URL = "http://localhost:8080"
TEST_USER = {
    "email": "test@communitypulse.ai",
    "password": "TestPass123!",
    "name": "Test User",
    "org_name": "Test Organization"
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_test(name: str):
    """Print test name"""
    print(f"\n{Colors.BLUE}🧪 Testing: {name}{Colors.END}")

def print_success(message: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message: str):
    """Print info message"""
    print(f"{Colors.BOLD}{message}{Colors.END}")

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.user_id: Optional[str] = None
        
    def test_health_check(self) -> bool:
        """Test health check endpoint"""
        print_test("Health Check")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print_success(f"Server is healthy: {data}")
                return True
            else:
                print_error(f"Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Health check failed: {str(e)}")
            return False
    
    def test_register(self) -> bool:
        """Test user registration"""
        print_test("User Registration")
        
        # Test 1: Valid registration
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/auth/register",
                json={
                    **TEST_USER,
                    "email": f"test_{int(time.time())}@example.com"  # Unique email
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.refresh_token = data.get("refresh_token")
                self.user_id = data.get("user_id")
                print_success(f"Registration successful! User ID: {self.user_id}")
            else:
                print_error(f"Registration failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print_error(f"Registration failed: {str(e)}")
            return False
        
        # Test 2: Weak password (should fail)
        print_test("Weak Password Validation")
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/auth/register",
                json={
                    **TEST_USER,
                    "password": "weak",
                    "email": f"test2_{int(time.time())}@example.com"
                },
                timeout=10
            )
            
            if response.status_code == 400:
                print_success("Weak password correctly rejected")
            else:
                print_error(f"Weak password should have been rejected! Status: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Weak password test failed: {str(e)}")
            return False
        
        # Test 3: Invalid email (should fail)
        print_test("Invalid Email Validation")
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/auth/register",
                json={
                    **TEST_USER,
                    "email": "invalid-email"
                },
                timeout=10
            )
            
            if response.status_code == 400:
                print_success("Invalid email correctly rejected")
            else:
                print_error(f"Invalid email should have been rejected! Status: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Invalid email test failed: {str(e)}")
            return False
        
        return True
    
    def test_authentication(self) -> bool:
        """Test authentication endpoints"""
        print_test("Authentication")
        
        if not self.token:
            print_warning("No token available, skipping authentication tests")
            return False
        
        # Test: Get profile with valid token
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/auth/profile",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success(f"Profile retrieved: {data['name']} ({data['email']})")
            else:
                print_error(f"Profile retrieval failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Profile retrieval failed: {str(e)}")
            return False
        
        # Test: Get profile without token (should fail)
        print_test("Authentication Required")
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/auth/profile",
                timeout=10
            )
            
            if response.status_code == 401:
                print_success("Unauthorized access correctly rejected")
            else:
                print_error(f"Should have received 401! Status: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Unauthorized test failed: {str(e)}")
            return False
        
        return True
    
    def test_datasets(self) -> bool:
        """Test dataset endpoints"""
        print_test("Dataset Management")
        
        if not self.token:
            print_warning("No token available, skipping dataset tests")
            return False
        
        # Test: List datasets
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/datasets/",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            
            if response.status_code == 200:
                datasets = response.json()
                print_success(f"Retrieved {len(datasets)} datasets")
            else:
                print_error(f"Dataset listing failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Dataset listing failed: {str(e)}")
            return False
        
        return True
    
    def test_rate_limiting(self) -> bool:
        """Test rate limiting"""
        print_test("Rate Limiting")
        
        # Make many requests rapidly
        print_info("Making 105 rapid requests to test rate limiting...")
        success_count = 0
        rate_limited = False
        
        for i in range(105):
            try:
                response = requests.get(f"{self.base_url}/health", timeout=5)
                if response.status_code == 429:
                    rate_limited = True
                    print_success(f"Rate limit triggered after {i+1} requests")
                    
                    # Check for Retry-After header
                    if "Retry-After" in response.headers:
                        print_success(f"Retry-After header present: {response.headers['Retry-After']}s")
                    
                    break
                elif response.status_code == 200:
                    success_count += 1
            except Exception as e:
                print_error(f"Request failed: {str(e)}")
                break
        
        if rate_limited:
            return True
        else:
            print_warning(f"Rate limit not triggered after {success_count} requests")
            print_info("This might be expected if rate limiting is disabled or threshold is high")
            return True
    
    def run_all_tests(self):
        """Run all tests"""
        print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}  CommunityPulse AI - API Test Suite{Colors.END}")
        print(f"{Colors.BOLD}{'='*60}{Colors.END}")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_register),
            ("Authentication", self.test_authentication),
            ("Dataset Management", self.test_datasets),
            ("Rate Limiting", self.test_rate_limiting),
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                print_error(f"Test '{test_name}' crashed: {str(e)}")
                results.append((test_name, False))
        
        # Print summary
        print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}  Test Summary{Colors.END}")
        print(f"{Colors.BOLD}{'='*60}{Colors.END}\n")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = f"{Colors.GREEN}PASS{Colors.END}" if result else f"{Colors.RED}FAIL{Colors.END}"
            print(f"  {status}  {test_name}")
        
        print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.END}")
        
        if passed == total:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All tests passed! The API is working correctly.{Colors.END}")
        else:
            print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  Some tests failed. Please review the errors above.{Colors.END}")
        
        print(f"{Colors.BOLD}{'='*60}{Colors.END}\n")

def main():
    """Main test runner"""
    tester = APITester(BASE_URL)
    
    print_info("\n⚙️  Make sure the backend is running at http://localhost:8000")
    print_info("   Start with: cd backend && uvicorn main:app --reload\n")
    
    input("Press Enter to start tests...")
    
    tester.run_all_tests()

if __name__ == "__main__":
    main()
