const automator = require('miniprogram-automator');
const path = require('path');
const MP_ROOT = path.resolve(__dirname, '../mp-weixin');

async function debug() {
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: MP_ROOT,
  });

  const page = await miniProgram.currentPage();
  await page.waitFor(3000);
  
  const wxml = await page.wxml();
  console.log('WXML Length:', wxml.length);
  
  // Dump the shop name
  const nameElement = await page.$('.restaurant_detail .name');
  if (nameElement) {
    console.log('Shop Name Text:', await nameElement.text());
  } else {
    console.log('Shop Name element NOT FOUND!');
  }

  await miniProgram.close();
}

debug().catch(console.error);
