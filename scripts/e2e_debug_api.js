const automator = require('miniprogram-automator');
const path = require('path');
const MP_ROOT = path.resolve(__dirname, '../mp-weixin');

async function debug() {
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: MP_ROOT,
  });

  const page = await miniProgram.currentPage();
  await page.waitFor(5000);
  
  const data = await page.data();
  console.log('dishListItems:', data.dishListItems && data.dishListItems.length);
  console.log('typeListData:', data.typeListData && data.typeListData.length);
  console.log('shopStatus:', data.shopStatus);
  console.log('typeIndex:', data.typeIndex);

  await miniProgram.close();
}

debug().catch(console.error);
