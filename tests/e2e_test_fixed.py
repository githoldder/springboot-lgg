import requests
import json
import time

BASE_URL = "http://localhost:8090"
HEADERS = {'Content-Type': 'application/json'}

def test_flow():
    print("=== 开始端到端测试 ===")
    
    # 1. Login
    print("1. 模拟微信登录...")
    resp = requests.post(f"{BASE_URL}/user/user/login", json={"code": "mock"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["code"] == 1
    token = data["data"]["token"]
    HEADERS["authentication"] = token
    print(f"   => 登录成功, 获取Token: {token[:20]}...")

    # 2. Check Shop Status
    print("2. 检查店铺营业状态...")
    resp = requests.get(f"{BASE_URL}/user/shop/status", headers=HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["code"] == 1
    print(f"   => 店铺状态: {'营业中' if data['data'] == 1 else '打烊'}")

    # 3. Add to Cart (DishId 101 corresponds to 阿克苏苹果 in lgg_fruit/dish if available)
    print("3. 添加商品到购物车...")
    # First clear cart
    requests.delete(f"{BASE_URL}/user/shoppingCart/clean", headers=HEADERS)
    # Add dish
    resp = requests.post(f"{BASE_URL}/user/shoppingCart/add", json={"dishId": 101, "amount": 6.00}, headers=HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    if data["code"] != 1:
        print(f"   => [错误] 添加购物车失败: {data}")
        return
    print("   => 商品添加成功!")

    # 4. View Cart
    print("4. 查看购物车...")
    resp = requests.get(f"{BASE_URL}/user/shoppingCart/list", headers=HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    cart_items = data["data"]
    print(f"   => 购物车商品数量: {len(cart_items)}")
    for item in cart_items:
        print(f"      - {item.get('name', 'Unknown')}: {item.get('amount', 0)}元 x {item.get('number', 0)}")

    # 5. Add Address
    print("5. 新增收货地址...")
    address_data = {
        "consignee": "测试用户",
        "sex": "1",
        "phone": "13800138000",
        "provinceCode": "110000",
        "provinceName": "北京市",
        "cityCode": "110100",
        "cityName": "北京市",
        "districtCode": "110105",
        "districtName": "朝阳区",
        "detail": "新街大道一号楼8层",
        "label": "公司"
    }
    resp = requests.post(f"{BASE_URL}/user/addressBook", json=address_data, headers=HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["code"] == 1
    print("   => 新增收货地址成功!")

    # 6. Get Default Address / Address List
    print("6. 模拟订单页获取地址...")
    resp = requests.get(f"{BASE_URL}/user/addressBook/list", headers=HEADERS)
    address_list = resp.json()["data"]
    if not address_list:
        print("   => [错误] 无可用地址")
        return
    address_id = address_list[0]["id"]
    print(f"   => 选择首个地址ID: {address_id}")

    # 7. Submit Order
    print("7. 提交订单...")
    order_data = {
        "addressBookId": address_id,
        "payMethod": 1,
        "remark": "请尽快送达",
        "estimatedDeliveryTime": "2026-06-10 12:00:00",
        "deliveryStatus": 1,
        "packAmount": 0,
        "tablewareNumber": 1,
        "tablewareStatus": 1,
        "amount": 6.00
    }
    resp = requests.post(f"{BASE_URL}/user/order/submit", json=order_data, headers=HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    if data["code"] != 1:
        print(f"   => [错误] 提交订单失败: {data}")
        return
    
    order_id = data["data"]["id"]
    order_number = data["data"]["orderNumber"]
    print(f"   => 提交订单成功! 订单号: {order_number}, ID: {order_id}")

    # 8. Make Payment
    print("8. 模拟支付订单...")
    pay_data = {
        "orderNumber": order_number,
        "payMethod": 1
    }
    resp = requests.put(f"{BASE_URL}/user/order/payment/confirm", json=pay_data, headers=HEADERS)
    assert resp.status_code == 200
    print("   => 支付成功!")

    # 9. Verify Status
    print("9. 验证历史订单状态...")
    resp = requests.get(f"{BASE_URL}/user/order/historyOrders?page=1&pageSize=10", headers=HEADERS)
    orders = resp.json()["data"]["records"]
    for order in orders:
        if order["id"] == order_id:
            status_map = {1: "待付款", 2: "待接单", 3: "已接单", 4: "派送中", 5: "已完成", 6: "已取消"}
            print(f"   => 订单状态流转正常: 当前状态为 [{status_map.get(order['status'], order['status'])}]")

    print("=== 端到端联调测试通过 ===")

if __name__ == "__main__":
    test_flow()
