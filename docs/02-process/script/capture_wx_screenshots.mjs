import automator from 'miniprogram-automator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCREENSHOT_DIR = path.join(__dirname, '../Figure/screenshots-real');

async function run() {
  console.log('Starting WeChat MiniProgram Automator...');
  
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // 启动开发者工具并连接
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli', // Mac默认路径
    projectPath: path.join(__dirname, '../../../mp-weixin'),
  });

  console.log('Connected to WeChat DevTools!');

  try {

    // 等待首页加载
    console.log('Waiting for IDE to settle...');
    await new Promise(r => setTimeout(r, 5000));
    
    let page;
    try {
      page = await miniProgram.currentPage();
      console.log('Current page:', page.path);
      if (!page.path.includes('pages/index/index')) {
        console.log('Relaunching to index...');
        page = await miniProgram.reLaunch('/pages/index/index');
      }
    } catch(e) {
      console.log('Error getting currentPage, trying to relaunch directly:', e);
      page = await miniProgram.reLaunch('/pages/index/index');
    }
    await page.waitFor(3000); // 等待商品列表渲染

    console.log('Adding item to cart...');
    // 找到第一个添加按钮并点击
    const addBtn = await page.$('.dish_add') || await page.$('.dish_card_add');
    if (addBtn) {
      await addBtn.tap();
      await page.waitFor(1000);
      console.log('Item added to cart.');
    } else {
      console.log('Could not find add to cart button, trying to proceed anyway (cart might already have items)...');
    }

    console.log('Navigating to checkout (order) page...');
    // 点击去结算
    const checkoutBtn = await page.$('.order_but');
    if (checkoutBtn) {
      await checkoutBtn.tap();
    } else {
      console.log('Checkout button not found, navigating via routing...');
      await miniProgram.navigateTo('/pages/order/index');
    }
    
    await miniProgram.waitFor(3000); // 确保跳转到结算页面并渲染完成
    page = await miniProgram.currentPage();
    console.log('Current page (should be order/index):', page.path);

    // 注入地址 (如果收货地址为空)
    console.log('Ensuring address exists...');
    try {
      await page.callMethod('getOrSetDefaultAddress', {
        phone: '13800138000',
        consignee: '测试用户',
        detail: '测试地址8号',
        id: 1
      });
    } catch(e){}
    
    // 强制截取 S07-wx-checkout-real.png
    console.log('Capturing checkout UI (S07)...');
    const screenshotPath07 = path.join(SCREENSHOT_DIR, 'S07-wx-checkout-real.png');
    await miniProgram.screenshot({
      path: screenshotPath07
    });
    console.log(`Saved ${screenshotPath07}`);

    // 点击去支付
    console.log('Triggering payment (go to pay page)...');
    const goPayBtn = await page.$('.order_but_rit');
    if (goPayBtn) {
      await goPayBtn.tap();
    } else {
      console.log('Payment button not found, trying to invoke payOrderHandle method directly...');
      await page.callMethod('payOrderHandle');
    }

    await miniProgram.waitFor(3000);
    page = await miniProgram.currentPage();
    console.log('Current page (should be pay/index):', page.path);

    // 在支付页面点击确认支付
    const confirmPayBtn = await page.$('.add_btn') || await page.$('.btn_submit');
    if (confirmPayBtn) {
      console.log('Clicking confirm payment...');
      await confirmPayBtn.tap();
    } else {
      await page.callMethod('handleSave');
    }

    // 等待支付成功页面
    console.log('Waiting for success page...');
    await miniProgram.waitFor(4000);
    page = await miniProgram.currentPage();
    console.log('Current page after payment:', page.path);
    
    if (page.path.includes('success')) {
      console.log('Payment success detected.');
    } else {
      console.log('Did not redirect to success page automatically, navigating manually to capture success state...');
      await miniProgram.navigateTo('/pages/success/index');
      await miniProgram.waitFor(2000);
    }

    // 截取支付成功闭环图
    console.log('Capturing payment success UI...');
    const screenshotPathSuccess = path.join(SCREENSHOT_DIR, 'S07-wx-pay-success-real.png');
    await miniProgram.screenshot({
      path: screenshotPathSuccess
    });
    console.log(`Saved ${screenshotPathSuccess}`);

  } catch (err) {
    console.error('Error during automation:', err);
  } finally {
    // 关闭
    await miniProgram.disconnect();
    console.log('Disconnected.');
  }
}

run();
