module.exports = {
  apps: [
    {
      name: 'lgg-ruoyi-backend',
      cwd: './ruoyi-vue-lgg-backend',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar ruoyi-admin/target/ruoyi-admin.jar',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true,
      env: {
        SPRING_PROFILES_ACTIVE: 'druid'
      }
    },
    {
      name: 'lgg-ruoyi-frontend',
      cwd: './ruoyi-vue-lgg-frontend',
      script: 'npx',
      args: 'vite --host 127.0.0.1 --port 8082',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
