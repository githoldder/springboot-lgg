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
  console.log('Page Data l0:', data.$root.l0);
  
  await miniProgram.close();
}

debug().catch(console.error);
