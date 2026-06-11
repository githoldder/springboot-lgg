const automator = require('miniprogram-automator');
const path = require('path');
const MP_ROOT = path.resolve(__dirname, '../mp-weixin');

async function debug() {
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: MP_ROOT,
  });

  miniProgram.on('appErr', err => console.error('App Error:', err));
  miniProgram.on('pageErr', err => console.error('Page Error:', err));
  miniProgram.on('console', msg => console.log('Console:', msg.type, msg.args));

  const page = await miniProgram.currentPage();
  console.log('Page loaded:', page.path);
  
  await page.waitFor(5000);
  
  const wxml = await page.wxml();
  console.log('WXML Length:', wxml.length);
  
  if (wxml.length < 500) {
    console.log('WXML is suspiciously small:');
    console.log(wxml);
  }
  
  await miniProgram.close();
}

debug().catch(console.error);
