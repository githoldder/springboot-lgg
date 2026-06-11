module.exports = {
  apps: [
    {
      name: 'lgg-redis',
      script: 'redis-server',
      args: '--port 6379',
      exec_mode: 'fork',
      instances: 1,
      watch: false
    },
    {
      name: 'lgg-minio',
      script: './bin/minio',
      args: 'server ./data --console-address :9001',
      exec_mode: 'fork',
      instances: 1,
      watch: false
    },
    {
      name: 'lgg-nacos',
      cwd: './bin/nacos',
      script: 'java',
      args: '-Xms512m -Xmx512m -Xmn256m -Dnacos.standalone=true -Dnacos.home=. -jar target/nacos-server.jar --spring.config.additional-location=file:./conf/ --logging.config=./conf/nacos-logback.xml --server.max-http-header-size=524288',
      exec_mode: 'fork',
      instances: 1,
      watch: false
    },
    {
      name: 'lgg-admin',
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
      name: 'lgg-business',
      cwd: './ruoyi-vue-lgg-backend',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar ruoyi-business/target/ruoyi-business.jar',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true,
      env: {
        SPRING_PROFILES_ACTIVE: 'druid'
      }
    },
    {
      name: 'lgg-gateway',
      cwd: './ruoyi-vue-lgg-backend',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar ruoyi-gateway/target/ruoyi-gateway.jar',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true
    },
    {
      name: 'lgg-ruoyi-frontend',
      cwd: './ruoyi-vue-lgg-frontend',
      script: 'npx',
      args: 'vite preview --port 8087 --host 127.0.0.1',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'lgg-pay',
      cwd: './ruoyi-vue-lgg-backend',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar ruoyi-pay/target/ruoyi-pay.jar',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true
    },
    {
      name: 'lgg-notice',
      cwd: './ruoyi-vue-lgg-backend',
      script: 'java',
      args: '-Dfile.encoding=UTF-8 -jar ruoyi-notice/target/ruoyi-notice.jar',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true
    }
  ]
};
