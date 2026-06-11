import re

with open('mp-weixin/pages/pay/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace the (0, _api.paymentOrder)(params).then(...) logic.
# Since the code is minified/compiled, we can just replace the specific string:
old_str = """        (0, _api.paymentOrder)(params).then(function (res) {
          if (res.code === 1) {
            wx.showModal({
              title: '提示',
              content: '支付成功',
              success:function(){
                uni.redirectTo({url: '/pages/success/index?orderId=' + _this.orderId });
              }
            })
            console.log('支付成功!')
      
            // wx.requestPayment({
            //   nonceStr: res.data.nonceStr,
            //   package: res.data.packageStr,
            //   paySign: res.data.paySign,
            //   timeStamp: res.data.timeStamp,
            //   signType: res.data.signType,
            //   success:function(res){
            //     wx.showModal({
            //       title: '提示',
            //       content: '支付成功',
            //       success:function(){
            //         uni.redirectTo({url: '/pages/success/index?orderId=' + _this.orderId });
            //       }
            //     })
            //     console.log('支付成功!')
            //   }
            // })


            // uni.redirectTo({url: '/pages/success/index?orderId=' + _this.orderId });

          } else {
            wx.showModal({
              title: '提示',
              content: res.msg
            })
          }
        });"""

new_str = """        wx.request({
          url: 'http://localhost:8090/pay/mock',
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: { orderNumber: _this.orderDataInfo.orderNumber },
          success: function(res) {
            if (res.data.code === 200) {
              wx.showModal({
                title: '提示',
                content: '支付成功',
                success: function() {
                  uni.redirectTo({ url: '/pages/success/index?orderId=' + _this.orderId });
                }
              });
            } else {
              wx.showModal({ title: '提示', content: res.data.msg || '支付失败' });
            }
          }
        });"""

if old_str in content:
    content = content.replace(old_str, new_str)
    with open('mp-weixin/pages/pay/index.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched mp-weixin/pages/pay/index.js successfully!")
else:
    print("Could not find the target string in mp-weixin/pages/pay/index.js!")

