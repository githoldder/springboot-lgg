const automator = require('miniprogram-automator');

automator.launch({
  cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
  projectPath: '/Users/caolei/Desktop/springboot-lgg/mp-weixin',
}).then(async miniProgram => {
  try {
    console.log('Automator connected.');
    
    // Listen to console events
    miniProgram.on('console', msg => {
      console.log(`[MiniProgram Console] ${msg.type}: ${msg.args.join(' ')}`);
    });
    
    miniProgram.on('exception', err => {
      console.log(`[MiniProgram Exception] ${err.message}`);
    });

    await miniProgram.waitFor(5000);
    const page = await miniProgram.currentPage();
    console.log('Current page:', page ? page.path : 'None');
    
  } catch (err) {
    console.error('Error in automation:', err);
  } finally {
    await miniProgram.close();
  }
});
