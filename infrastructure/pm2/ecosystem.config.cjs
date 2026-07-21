module.exports = {
  apps: [
    {
      name: 'lgg-admin',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar backend/ruoyi-admin.jar',
      cwd: '/opt/lgg',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      env: {
        SPRING_PROFILES_ACTIVE: 'druid'
      }
    },
    {
      name: 'lgg-business',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar backend/ruoyi-business.jar',
      cwd: '/opt/lgg',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      env: {
        SPRING_PROFILES_ACTIVE: 'druid'
      }
    },
    {
      name: 'lgg-gateway',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar backend/ruoyi-gateway.jar',
      cwd: '/opt/lgg',
      exec_mode: 'fork',
      instances: 1,
      watch: false
    },
    {
      name: 'lgg-pay',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar backend/ruoyi-pay.jar',
      cwd: '/opt/lgg',
      exec_mode: 'fork',
      instances: 1,
      watch: false
    },
    {
      name: 'lgg-notice',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar backend/ruoyi-notice.jar',
      cwd: '/opt/lgg',
      exec_mode: 'fork',
      instances: 1,
      watch: false
    }
  ]
};
