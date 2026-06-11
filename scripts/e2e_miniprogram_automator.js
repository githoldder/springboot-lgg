const automator = require('miniprogram-automator');
const path = require('path');
const MP_ROOT = path.resolve(__dirname, '../mp-weixin');

async function runTest() {
  console.log("启动微信开发者工具 CLI...");
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: MP_ROOT,
  });

  try {
    const page = await miniProgram.currentPage();
    console.log("当前页面:", page.path);
    await page.waitFor(5000); // 等待网络加载数据

    console.log("尝试获取添加购物车按钮...");
    const addBtns = await page.$$('.dish_add');
    if (addBtns && addBtns.length > 0) {
      console.log(`找到 ${addBtns.length} 个商品添加按钮，点击第一个...`);
      await addBtns[0].tap();
      await page.waitFor(1000);
      
      console.log("检查底部购物车总数...");
      const cartNum = await page.$('.order_dish_num');
      if (cartNum) {
        const numText = await cartNum.text();
        console.log(`=> 购物车数量: ${numText}`);
      } else {
        console.log("=> 购物车数量未找到");
      }
      
      console.log("检查底部购物车总价...");
      const cartPrice = await page.$('.order_price');
      if (cartPrice) {
        const priceText = await cartPrice.text();
        console.log(`=> 购物车总价: ${priceText}`);
      } else {
        console.log("=> 购物车总价未找到");
      }
    } else {
      console.log("未找到商品添加按钮，可能商品列表为空或渲染失败。");
    }
    
    console.log("测试通过!");
  } catch (e) {
    console.error("测试异常:", e);
  } finally {
    await miniProgram.close();
  }
}

runTest();
