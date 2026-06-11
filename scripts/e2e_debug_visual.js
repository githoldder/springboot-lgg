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
  
  const homeContent = await page.$('.home_content');
  if (homeContent) {
    const offset = await homeContent.offset();
    console.log('home_content offset:', offset);
  }

  const projectBox = await page.$('.project_box');
  if (projectBox) {
    const offset = await projectBox.offset();
    console.log('project_box offset:', offset);
  }

  await miniProgram.close();
}

debug().catch(console.error);
