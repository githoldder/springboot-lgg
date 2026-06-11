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
  
  // Dump the style of page and home_content
  const pageElement = await page.$('page');
  console.log('page style:', await pageElement.style('background-color'));
  
  const homeContent = await page.$('.home_content');
  if (homeContent) {
    console.log('home_content display:', await homeContent.style('display'));
    console.log('home_content opacity:', await homeContent.style('opacity'));
  }

  // Check if any element covers the screen
  const wxml = await page.wxml();
  console.log('WXML length:', wxml.length);

  await miniProgram.close();
}

debug().catch(console.error);
