const automator = require('miniprogram-automator');

automator.launch({
  cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
  projectPath: '/Users/caolei/Desktop/springboot-lgg/mp-weixin',
}).then(async miniProgram => {
  try {
    const page = await miniProgram.currentPage();
    const wxml = await page.wxml();
    console.log('--- WXML ---');
    console.log(wxml);
    console.log('------------');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await miniProgram.close();
  }
});
