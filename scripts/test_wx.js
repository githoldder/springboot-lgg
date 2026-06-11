const automator = require('miniprogram-automator');

(async () => {
  let miniProgram;
  try {
    miniProgram = await automator.launch({
      cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
      projectPath: '/Users/caolei/Desktop/springboot-lgg/mp-weixin',
    });
    
    console.log('Automator connected successfully!');
    const page = await miniProgram.currentPage();
    console.log('Current page path:', page.path);
    
    // Capture screenshot to prove we can see it
    await miniProgram.screenshot({
      path: '/Users/caolei/Desktop/springboot-lgg/docs/02-process/Figure/screenshots-real/wechat-test.png'
    });
    console.log('Screenshot saved to wechat-test.png');
    
  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    if (miniProgram) {
      await miniProgram.close();
    }
  }
})();
