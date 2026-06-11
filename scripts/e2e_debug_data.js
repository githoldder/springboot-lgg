const automator = require('miniprogram-automator');
const path = require('path');
const MP_ROOT = path.resolve(__dirname, '../mp-weixin');

async function debug() {
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: MP_ROOT,
  });

  const page = await miniProgram.currentPage();
  const data = await page.data();
  console.log('Page Data ht:', data.ht);
  console.log('Page Data Keys:', Object.keys(data));
  
  await miniProgram.close();
}

debug().catch(console.error);
