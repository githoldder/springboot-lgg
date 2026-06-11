const automator = require('miniprogram-automator');

automator.launch({
  cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
  projectPath: '/Users/caolei/Desktop/springboot-lgg/mp-weixin',
}).then(async miniProgram => {
  try {
    const page = await miniProgram.currentPage();
    
    // Instead of page.wxml(), we do page.outerWxml()
    const wxml = await page.outerWxml();
    console.log('--- WXML ---');
    console.log(wxml);
    console.log('------------');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await miniProgram.close();
  }
});
