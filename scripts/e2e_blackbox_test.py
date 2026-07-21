import urllib.request
import json
import sys

def test_url(name, url, expected_status=200, check_str=None):
    print(f"[Testing {name}] {url} ...", end=" ")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.getcode()
            content = response.read().decode('utf-8', errors='ignore')
            if status == expected_status:
                if check_str and check_str not in content:
                    print(f"FAILED (Missing keyword: '{check_str}')")
                    return False
                print(f"SUCCESS (HTTP {status})")
                return True
            else:
                print(f"FAILED (HTTP {status}, Expected {expected_status})")
                return False
    except Exception as e:
        print(f"FAILED (Error: {e})")
        return False

def main():
    print("==========================================")
    print("  E2E Blackbox Integration Verification   ")
    print("==========================================")

    results = []

    # 1. Web B-End Frontend (HTTP 200 + Title check)
    results.append(test_url("Web Admin Frontend", "http://192.168.139.114/", 200, "常工鲜生管理系统"))

    # 2. Miniapp C-End / Microservice API Gateway (HTTP 200 + JSON code check)
    results.append(test_url("Miniapp / Microservice API", "http://192.168.139.114/prod-api/system/user/profile", 200, "code"))

    # 3. Nacos Dashboard (HTTP 200)
    results.append(test_url("Nacos Config & Discovery", "http://localhost:8848/nacos/", 200))

    # 4. MinIO Object Storage Console (HTTP 200)
    results.append(test_url("MinIO Object Storage Console", "http://localhost:9001/", 200))

    print("==========================================")
    if all(results):
        print("🎉 ALL E2E BLACKBOX TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("❌ SOME E2E BLACKBOX TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
