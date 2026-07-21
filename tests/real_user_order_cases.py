import os
import time
import json
import subprocess
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

RIDERS = {
    "dispatcher": {"id": 4, "name": "骑手调度员", "phone": "13812312315"},
    "rider01": {"id": 5, "name": "专职骑手01", "phone": "13812312316"},
    "rider02": {"id": 6, "name": "兼职配送员02", "phone": "13812312317"},
    "rider03": {"id": 7, "name": "高级骑手03", "phone": "13812312318"}
}

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
        "expectedStatus": 5,
        "dayOffset": 0,
        "rider": RIDERS["dispatcher"]
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
        "expectedStatus": 5,
        "dayOffset": 1,
        "rider": RIDERS["rider01"]
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
        "expectedStatus": 5,
        "dayOffset": 2,
        "rider": RIDERS["rider02"]
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
        "expectedStatus": 5,
        "dayOffset": 3,
        "rider": RIDERS["rider03"]
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
        "expectedStatus": 5,
        "dayOffset": 4,
        "rider": RIDERS["dispatcher"]
    },
    {
        "slug": "sun-bo-apartment",
        "login": {"name": "孙波", "sex": "1"},
        "phone": "13511112222",
        "address": {
            "consignee": "孙波",
            "sex": "1",
            "phone": "13511112222",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320402",
            "districtName": "天宁区",
            "detail": "翠竹新村12幢201室",
            "label": "家",
        },
        "items": [
            {"dishId": 113, "name": "缤纷家庭分享果切(600g)", "number": 1, "price": "25.00"},
        ],
        "expectedAmount": "25.00",
        "remark": "请放门口",
        "expectedStatus": 5,
        "dayOffset": 5,
        "rider": RIDERS["rider01"]
    },
    {
        "slug": "wu-mei-office",
        "login": {"name": "吴美", "sex": "2"},
        "phone": "13922223333",
        "address": {
            "consignee": "吴美",
            "sex": "2",
            "phone": "13922223333",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320411",
            "districtName": "新北区",
            "detail": "科教城三号楼401",
            "label": "公司",
        },
        "items": [
            {"dishId": 132, "name": "鲜榨椰子汁(350ml)", "number": 1, "price": "15.00"},
        ],
        "expectedAmount": "15.00",
        "remark": "下午送达",
        "expectedStatus": 6,
        "dayOffset": 2,
        "cancelReason": "用户申请退款"
    },
    {
        "slug": "zheng-hong-home",
        "login": {"name": "郑红", "sex": "2"},
        "phone": "13833334444",
        "address": {
            "consignee": "郑红",
            "sex": "2",
            "phone": "13833334444",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320404",
            "districtName": "钟楼区",
            "detail": "嘉宏盛世8幢1001",
            "label": "家",
        },
        "items": [
            {"dishId": 132, "name": "鲜榨椰子汁(350ml)", "number": 1, "price": "15.00"},
        ],
        "expectedAmount": "15.00",
        "remark": "到了打电话",
        "expectedStatus": 4,
        "dayOffset": 0,
        "rider": RIDERS["rider02"]
    },
    {
        "slug": "feng-lei-school",
        "login": {"name": "冯雷", "sex": "1"},
        "phone": "13744445555",
        "address": {
            "consignee": "冯雷",
            "sex": "1",
            "phone": "13744445555",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320411",
            "districtName": "新北区",
            "detail": "北区宿舍A幢",
            "label": "学校",
        },
        "items": [
            {"dishId": 131, "name": "鲜榨橙汁(350ml)", "number": 1, "price": "12.00"},
        ],
        "expectedAmount": "12.00",
        "remark": "下课后送",
        "expectedStatus": 2,
        "dayOffset": 0
    },
    {
        "slug": "chen-yang-hotel",
        "login": {"name": "陈阳", "sex": "1"},
        "phone": "13655556666",
        "address": {
            "consignee": "陈阳",
            "sex": "1",
            "phone": "13655556666",
            "provinceCode": "320000",
            "provinceName": "江苏省",
            "cityCode": "320400",
            "cityName": "常州市",
            "districtCode": "320412",
            "districtName": "武进区",
            "detail": "淹城大酒店502",
            "label": "公司",
        },
        "items": [
            {"dishId": 111, "name": "鲜切西瓜拼盘(300g)", "number": 1, "price": "9.90"},
        ],
        "expectedAmount": "9.90",
        "remark": "送前台即可",
        "expectedStatus": 1,
        "dayOffset": 0
    }
]

def _api(method, path, token=None, **kwargs):
    headers = kwargs.pop("headers", {})
    headers.setdefault("Content-Type", "application/json")
    if token:
        headers["authentication"] = token
    body = _request_json(method, path, headers=headers, **kwargs)
    assert body.get("code") == 1, body
    return body.get("data")

def _admin_api(method, path, admin_token, **kwargs):
    headers = kwargs.pop("headers", {})
    headers.setdefault("Content-Type", "application/json")
    headers["token"] = admin_token
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

    # Transition order state
    expected_status = case.get("expectedStatus", 1)
    order_id = submit_data["id"]
    order_number = submit_data["orderNumber"]

    if expected_status >= 2:
        _api("PUT", "/user/order/payment/confirm", token=token, json={"orderNumber": order_number, "payMethod": 1})

    if expected_status >= 3 and expected_status != 6:
        admin_token = _api("POST", "/admin/employee/login", json={"username": "admin", "password": "123456"})["token"]
        _admin_api("PUT", "/admin/order/confirm", admin_token, json={"id": order_id, "status": 3})

    if expected_status >= 4 and expected_status != 6:
        rider = case["rider"]
        _admin_api("PUT", "/admin/order/assignRider", admin_token, json={
            "orderId": order_id,
            "riderId": rider["id"],
            "riderName": rider["name"],
            "riderPhone": rider["phone"]
        })

    if expected_status == 5:
        _admin_api("PUT", f"/admin/order/complete/{order_id}", admin_token)

    if expected_status == 6:
        admin_token = _api("POST", "/admin/employee/login", json={"username": "admin", "password": "123456"})["token"]
        _admin_api("PUT", "/admin/order/cancel", admin_token, json={"id": order_id, "cancelReason": case.get("cancelReason", "用户取消")})

    # Backdate in MySQL directly
    day_offset = case.get("dayOffset", 0)
    if day_offset > 0:
        sql = f"USE lgg_ruoyi; UPDATE lgg_orders SET order_time = NOW() - INTERVAL {day_offset} DAY, checkout_time = NOW() - INTERVAL {day_offset} DAY"
        if expected_status == 5:
            sql += f", delivery_time = NOW() - INTERVAL {day_offset} DAY, actual_delivery_time = NOW() - INTERVAL {day_offset} DAY"
        sql += f" WHERE id = {order_id};"
        subprocess.run(["mysql", "-uroot", "-p123456", "-e", sql], check=True)

if __name__ == "__main__":
    if not _server_available():
        raise SystemExit(f"{BASE_URL} is not running")
    
    # Clean previous demo orders to start fresh
    subprocess.run(["mysql", "-uroot", "-p123456", "-e", "USE lgg_ruoyi; DELETE FROM lgg_order_detail; DELETE FROM lgg_orders;"], check=True)
    
    for case in ORDER_CASES:
        print(f"running {case['slug']} ...")
        test_real_user_submit_order_cases(case)
    print(f"passed {len(ORDER_CASES)} real user order cases and initialized dashboard mock data successfully!")
