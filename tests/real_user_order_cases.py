import os
import time
import json
import urllib.error
import urllib.request
from decimal import Decimal

try:
    import requests
except ModuleNotFoundError:
    requests = None

try:
    import pytest
except ModuleNotFoundError:
    class _PytestFallback:
        class mark:
            @staticmethod
            def integration(func):
                return func

            @staticmethod
            def parametrize(*_args, **_kwargs):
                return lambda func: func

        @staticmethod
        def skip(message):
            raise RuntimeError(message)

    pytest = _PytestFallback()

BASE_URL = os.getenv("LGG_BASE_URL", "http://127.0.0.1:8090")
TIMEOUT = 8
_URL_OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))


ORDER_CASES = [
    {
        "slug": "wang-xiaoyu-office",
        "login": {"name": "王小雨", "sex": "2"},
        "phone": "13900010001",
        "address": {
            "consignee": "王小雨",
            "sex": "2",
            "phone": "13900010001",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320402",
            "districtName": "天宁区",
            "detail": "晋陵中路常工鲜生写字楼A座1206室",
            "label": "公司",
        },
        "items": [
            {"dishId": 101, "name": "阿克苏苹果(500g)", "number": 2, "price": "8.80"},
            {"dishId": 103, "name": "精品红颜草莓(250g)", "number": 1, "price": "18.00"},
        ],
        "expectedAmount": "35.60",
        "remark": "工作日午休前送达，水果不要挤压",
    },
    {
        "slug": "li-chen-dorm",
        "login": {"name": "李晨", "sex": "1"},
        "phone": "13811112222",
        "address": {
            "consignee": "李晨",
            "sex": "1",
            "phone": "13811112222",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320411",
            "districtName": "新北区",
            "detail": "河海东路88号常州工学院西区学生公寓3栋512",
            "label": "学校",
        },
        "items": [
            {"dishId": 111, "name": "鲜切西瓜拼盘(300g)", "number": 3, "price": "9.90"},
        ],
        "expectedAmount": "29.70",
        "remark": "宿舍楼下电话联系",
    },
    {
        "slug": "zhao-min-family",
        "login": {"name": "赵敏", "sex": "2"},
        "phone": "13722223333",
        "address": {
            "consignee": "赵敏",
            "sex": "2",
            "phone": "13722223333",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320412",
            "districtName": "武进区",
            "detail": "滆湖中路21号绿地香颂6幢1802室",
            "label": "家",
        },
        "items": [
            {"dishId": 104, "name": "海南贵妃芒果(500g)", "number": 2, "price": "12.50"},
            {"dishId": 131, "name": "鲜榨橙汁(350ml)", "number": 2, "price": "12.00"},
        ],
        "expectedAmount": "49.00",
        "remark": "家里有老人，麻烦送到门口",
    },
    {
        "slug": "chen-an-hospital",
        "login": {"name": "陈安", "sex": "1"},
        "phone": "13633334444",
        "address": {
            "consignee": "陈安",
            "sex": "1",
            "phone": "13633334444",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320404",
            "districtName": "钟楼区",
            "detail": "怀德中路68号门诊楼一层服务台",
            "label": "医院",
        },
        "items": [
            {"dishId": 105, "name": "智利进口车厘子(500g)", "number": 1, "price": "49.90"},
            {"dishId": 101, "name": "阿克苏苹果(500g)", "number": 1, "price": "8.80"},
        ],
        "expectedAmount": "58.70",
        "remark": "探望病人，请保持包装完整",
    },
    {
        "slug": "zhou-jiayi-gift",
        "login": {"name": "周佳怡", "sex": "2"},
        "phone": "13544445555",
        "address": {
            "consignee": "周佳怡",
            "sex": "2",
            "phone": "13544445555",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320413",
            "districtName": "金坛区",
            "detail": "东环一路9号科创园B楼302",
            "label": "礼品",
        },
        "items": [
            {"dishId": 102, "name": "泰国金枕榴莲(2.5kg)", "number": 1, "price": "69.90"},
        ],
        "expectedAmount": "69.90",
        "remark": "客户礼品，请附带完整小票",
    },
]


def _api(method, path, token=None, **kwargs):
    headers = kwargs.pop("headers", {})
    headers.setdefault("Content-Type", "application/json")
    if token:
        headers["authentication"] = token
    body = _request_json(method, path, headers=headers, **kwargs)
    assert body.get("code") == 1, body
    return body.get("data")


def _request_json(method, path, headers=None, **kwargs):
    url = f"{BASE_URL}{path}"
    headers = headers or {}
    payload = kwargs.get("json")
    if requests is not None:
        response = requests.request(
            method,
            url,
            headers=headers,
            timeout=TIMEOUT,
            json=payload,
        )
        response.raise_for_status()
        return response.json()

    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    with _URL_OPENER.open(request, timeout=TIMEOUT) as response:
        return json.loads(response.read().decode("utf-8"))


def _server_available():
    try:
        if requests is not None:
            requests.get(f"{BASE_URL}/user/shop/status", timeout=2)
        else:
            _URL_OPENER.open(f"{BASE_URL}/user/shop/status", timeout=2).close()
        return True
    except (urllib.error.URLError, TimeoutError, Exception):
        return False


@pytest.mark.integration
@pytest.mark.parametrize("case", ORDER_CASES, ids=[case["slug"] for case in ORDER_CASES])
def test_real_user_submit_order_cases(case):
    if not _server_available():
        pytest.skip(f"{BASE_URL} is not running")

    login_code = f"mock_real_order_{case['slug']}_{int(time.time())}"
    login_payload = {
        "code": login_code,
        "name": case["login"]["name"],
        "sex": case["login"]["sex"],
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    }
    login_data = _api("POST", "/user/user/login", json=login_payload)
    token = login_data["token"]

    _api("DELETE", "/user/shoppingCart/clean", token=token)
    for item in case["items"]:
        _api(
            "POST",
            "/user/shoppingCart/add",
            token=token,
            json={"dishId": item["dishId"], "number": item["number"]},
        )

    cart = _api("GET", "/user/shoppingCart/list", token=token)
    actual_cart_total = sum(Decimal(str(item["amount"])) * item["number"] for item in cart)
    assert actual_cart_total == Decimal(case["expectedAmount"]), {
        "case": case["slug"],
        "expected": case["expectedAmount"],
        "actual": str(actual_cart_total),
        "cart": cart,
    }

    _api("POST", "/user/addressBook", token=token, json=case["address"])
    addresses = _api("GET", "/user/addressBook/list", token=token)
    address = next(item for item in addresses if item["phone"] == case["phone"])

    submit_data = _api(
        "POST",
        "/user/order/submit",
        token=token,
        json={
            "addressBookId": address["id"],
            "payMethod": 1,
            "remark": case["remark"],
            "deliveryStatus": 1,
            "deliveryType": "DELIVERY",
            "packAmount": 0,
            "tablewareNumber": 1,
            "tablewareStatus": 1,
            "amount": "0.01",
        },
    )

    assert Decimal(str(submit_data["orderAmount"])) == Decimal(case["expectedAmount"])
    detail = _api("GET", f"/user/order/orderDetail/{submit_data['id']}", token=token)
    assert detail["consignee"] == case["address"]["consignee"]
    assert detail["phone"] == case["phone"]
    assert case["address"]["detail"] in detail["address"]
    assert Decimal(str(detail["amount"])) == Decimal(case["expectedAmount"])

    expected_names = {item["name"] for item in case["items"]}
    actual_names = {item["name"] for item in detail["orderDetailList"]}
    assert expected_names.issubset(actual_names)


if __name__ == "__main__":
    if not _server_available():
        raise SystemExit(f"{BASE_URL} is not running")
    for case in ORDER_CASES:
        print(f"running {case['slug']} ...")
        test_real_user_submit_order_cases(case)
    print(f"passed {len(ORDER_CASES)} real user order cases")
