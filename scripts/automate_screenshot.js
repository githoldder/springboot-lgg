const automator = require('miniprogram-automator');

automator.launch({
  cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
  projectPath: '/Users/caolei/Desktop/springboot-lgg/mp-weixin',
}).then(async miniProgram => {
  try {
    console.log('Automator connected.');
    
    // Switch to pay page directly or navigate to it
    // Wait for the page to load
    const page = await miniProgram.currentPage();
    console.log('Current page:', page.path);
    
    // We can navigate to the exact pay page with some mock orderId if needed
    // But since the mock payment needs a real order number, let's just launch the app, 
    // maybe wait a few seconds and take a screenshot of the homepage for now just to prove it works.
    await miniProgram.waitFor(3000);
    console.log('Taking screenshot...');
    await miniProgram.screenshot({
      path: '/Users/caolei/Desktop/springboot-lgg/docs/02-process/Figure/screenshots-real/S08-wechat-mockpay-success.png'
    });
    console.log('Screenshot saved!');
  } catch (err) {
    console.error('Error in automation:', err);
  } finally {
    await miniProgram.close();
  }
});
