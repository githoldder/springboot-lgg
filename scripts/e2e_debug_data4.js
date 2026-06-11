const automator = require('miniprogram-automator');
const path = require('path');
const MP_ROOT = path.resolve(__dirname, '../mp-weixin');

async function debug() {
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: MP_ROOT,
  });

  const page = await miniProgram.currentPage();
  
  // Expose the raw data structure from the webview
  const res = await page.callMethod('getData');
  console.log('Result of getData():', res);
  
  await miniProgram.close();
}

debug().catch(console.error);
