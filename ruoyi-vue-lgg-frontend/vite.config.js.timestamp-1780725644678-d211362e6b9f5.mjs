// vite.config.js
import { defineConfig, loadEnv } from "file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-frontend/node_modules/.pnpm/vite@5.0.4_@types+node@25.9.1_sass@1.69.5/node_modules/vite/dist/node/index.js";
import path2 from "path";

// vite/plugins/index.js
import vue from "file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-frontend/node_modules/.pnpm/@vitejs+plugin-vue@5.0.1_vite@5.0.4_@types+node@25.9.1_sass@1.69.5__vue@3.4.0/node_modules/@vitejs/plugin-vue/dist/index.mjs";

// vite/plugins/auto-import.js
import autoImport from "file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-frontend/node_modules/.pnpm/unplugin-auto-import@0.17.1_@vueuse+core@10.6.1_vue@3.4.0__rollup@4.60.4/node_modules/unplugin-auto-import/dist/vite.js";
function createAutoImport() {
  return autoImport({
    imports: [
      "vue",
      "vue-router",
      "pinia"
    ],
    dts: false
  });
}

// vite/plugins/svg-icon.js
import { createSvgIconsPlugin } from "file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-frontend/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.0.4_@types+node@25.9.1_sass@1.69.5_/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import path from "path";
function createSvgIcon(isBuild) {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), "src/assets/icons/svg")],
    symbolId: "icon-[dir]-[name]",
    svgoOptions: isBuild
  });
}

// vite/plugins/compression.js
import compression from "file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-frontend/node_modules/.pnpm/vite-plugin-compression@0.5.1_vite@5.0.4_@types+node@25.9.1_sass@1.69.5_/node_modules/vite-plugin-compression/dist/index.mjs";
function createCompression(env) {
  const { VITE_BUILD_COMPRESS } = env;
  const plugin = [];
  if (VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(",");
    if (compressList.includes("gzip")) {
      plugin.push(
        compression({
          ext: ".gz",
          deleteOriginFile: false
        })
      );
    }
    if (compressList.includes("brotli")) {
      plugin.push(
        compression({
          ext: ".br",
          algorithm: "brotliCompress",
          deleteOriginFile: false
        })
      );
    }
  }
  return plugin;
}

// vite/plugins/setup-extend.js
import setupExtend from "file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-frontend/node_modules/.pnpm/unplugin-vue-setup-extend-plus@1.0.0/node_modules/unplugin-vue-setup-extend-plus/dist/vite.js";
function createSetupExtend() {
  return setupExtend({});
}

// vite/plugins/index.js
function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue()];
  vitePlugins.push(createAutoImport());
  vitePlugins.push(createSetupExtend());
  vitePlugins.push(createSvgIcon(isBuild));
  isBuild && vitePlugins.push(...createCompression(viteEnv));
  return vitePlugins;
}

// vite.config.js
var __vite_injected_original_dirname = "/Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-frontend";
var vite_config_default = defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV } = env;
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    base: VITE_APP_ENV === "production" ? "/" : "/",
    plugins: createVitePlugins(env, command === "build"),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        "~": path2.resolve(__vite_injected_original_dirname, "./"),
        // 设置别名
        "@": path2.resolve(__vite_injected_original_dirname, "./src")
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    },
    // vite 相关配置
    server: {
      port: 8082,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        "/dev-api": {
          target: "http://localhost:8090",
          // target: 'https://api.wzs.pub/mock/13',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, "")
        }
      }
    },
    //fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAidml0ZS9wbHVnaW5zL2luZGV4LmpzIiwgInZpdGUvcGx1Z2lucy9hdXRvLWltcG9ydC5qcyIsICJ2aXRlL3BsdWdpbnMvc3ZnLWljb24uanMiLCAidml0ZS9wbHVnaW5zL2NvbXByZXNzaW9uLmpzIiwgInZpdGUvcGx1Z2lucy9zZXR1cC1leHRlbmQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvY2FvbGVpL0Rlc2t0b3Avc3ByaW5nYm9vdC1sZ2cvcnVveWktdnVlLWxnZy1mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBjcmVhdGVWaXRlUGx1Z2lucyBmcm9tICcuL3ZpdGUvcGx1Z2lucydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlLCBjb21tYW5kIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpKVxuICBjb25zdCB7IFZJVEVfQVBQX0VOViB9ID0gZW52XG4gIHJldHVybiB7XG4gICAgLy8gXHU5MEU4XHU3RjcyXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU1NDhDXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RTBCXHU3Njg0VVJMXHUzMDAyXG4gICAgLy8gXHU5RUQ4XHU4QkE0XHU2MEM1XHU1MUI1XHU0RTBCXHVGRjBDdml0ZSBcdTRGMUFcdTUwNDdcdThCQkVcdTRGNjBcdTc2ODRcdTVFOTRcdTc1MjhcdTY2MkZcdTg4QUJcdTkwRThcdTdGNzJcdTU3MjhcdTRFMDBcdTRFMkFcdTU3REZcdTU0MERcdTc2ODRcdTY4MzlcdThERUZcdTVGODRcdTRFMEFcbiAgICAvLyBcdTRGOEJcdTU5ODIgaHR0cHM6Ly93d3cucnVveWkudmlwL1x1MzAwMlx1NTk4Mlx1Njc5Q1x1NUU5NFx1NzUyOFx1ODhBQlx1OTBFOFx1N0Y3Mlx1NTcyOFx1NEUwMFx1NEUyQVx1NUI1MFx1OERFRlx1NUY4NFx1NEUwQVx1RkYwQ1x1NEY2MFx1NUMzMVx1OTcwMFx1ODk4MVx1NzUyOFx1OEZEOVx1NEUyQVx1OTAwOVx1OTg3OVx1NjMwN1x1NUI5QVx1OEZEOVx1NEUyQVx1NUI1MFx1OERFRlx1NUY4NFx1MzAwMlx1NEY4Qlx1NTk4Mlx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NEY2MFx1NzY4NFx1NUU5NFx1NzUyOFx1ODhBQlx1OTBFOFx1N0Y3Mlx1NTcyOCBodHRwczovL3d3dy5ydW95aS52aXAvYWRtaW4vXHVGRjBDXHU1MjE5XHU4QkJFXHU3RjZFIGJhc2VVcmwgXHU0RTNBIC9hZG1pbi9cdTMwMDJcbiAgICBiYXNlOiBWSVRFX0FQUF9FTlYgPT09ICdwcm9kdWN0aW9uJyA/ICcvJyA6ICcvJyxcbiAgICBwbHVnaW5zOiBjcmVhdGVWaXRlUGx1Z2lucyhlbnYsIGNvbW1hbmQgPT09ICdidWlsZCcpLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIC8vIGh0dHBzOi8vY24udml0ZWpzLmRldi9jb25maWcvI3Jlc29sdmUtYWxpYXNcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1OERFRlx1NUY4NFxuICAgICAgICAnfic6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLycpLFxuICAgICAgICAvLyBcdThCQkVcdTdGNkVcdTUyMkJcdTU0MERcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKVxuICAgICAgfSxcbiAgICAgIC8vIGh0dHBzOi8vY24udml0ZWpzLmRldi9jb25maWcvI3Jlc29sdmUtZXh0ZW5zaW9uc1xuICAgICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy52dWUnXVxuICAgIH0sXG4gICAgLy8gdml0ZSBcdTc2RjhcdTUxNzNcdTkxNERcdTdGNkVcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDgwODIsXG4gICAgICBob3N0OiB0cnVlLFxuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIGh0dHBzOi8vY24udml0ZWpzLmRldi9jb25maWcvI3NlcnZlci1wcm94eVxuICAgICAgICAnL2Rldi1hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDkwJyxcbiAgICAgICAgICAvLyB0YXJnZXQ6ICdodHRwczovL2FwaS53enMucHViL21vY2svMTMnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocCkgPT4gcC5yZXBsYWNlKC9eXFwvZGV2LWFwaS8sICcnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvL2ZpeDplcnJvcjpzdGRpbj46NzM1NjoxOiB3YXJuaW5nOiBcIkBjaGFyc2V0XCIgbXVzdCBiZSB0aGUgZmlyc3QgcnVsZSBpbiB0aGUgZmlsZVxuICAgIGNzczoge1xuICAgICAgcG9zdGNzczoge1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgcG9zdGNzc1BsdWdpbjogJ2ludGVybmFsOmNoYXJzZXQtcmVtb3ZhbCcsXG4gICAgICAgICAgICBBdFJ1bGU6IHtcbiAgICAgICAgICAgICAgY2hhcnNldDogKGF0UnVsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhdFJ1bGUubmFtZSA9PT0gJ2NoYXJzZXQnKSB7XG4gICAgICAgICAgICAgICAgICBhdFJ1bGUucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvY2FvbGVpL0Rlc2t0b3Avc3ByaW5nYm9vdC1sZ2cvcnVveWktdnVlLWxnZy1mcm9udGVuZC92aXRlL3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9jYW9sZWkvRGVza3RvcC9zcHJpbmdib290LWxnZy9ydW95aS12dWUtbGdnLWZyb250ZW5kL3ZpdGUvcGx1Z2lucy9pbmRleC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvY2FvbGVpL0Rlc2t0b3Avc3ByaW5nYm9vdC1sZ2cvcnVveWktdnVlLWxnZy1mcm9udGVuZC92aXRlL3BsdWdpbnMvaW5kZXguanNcIjtpbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcblxuaW1wb3J0IGNyZWF0ZUF1dG9JbXBvcnQgZnJvbSAnLi9hdXRvLWltcG9ydCdcbmltcG9ydCBjcmVhdGVTdmdJY29uIGZyb20gJy4vc3ZnLWljb24nXG5pbXBvcnQgY3JlYXRlQ29tcHJlc3Npb24gZnJvbSAnLi9jb21wcmVzc2lvbidcbmltcG9ydCBjcmVhdGVTZXR1cEV4dGVuZCBmcm9tICcuL3NldHVwLWV4dGVuZCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlVml0ZVBsdWdpbnModml0ZUVudiwgaXNCdWlsZCA9IGZhbHNlKSB7XG4gICAgY29uc3Qgdml0ZVBsdWdpbnMgPSBbdnVlKCldXG4gICAgdml0ZVBsdWdpbnMucHVzaChjcmVhdGVBdXRvSW1wb3J0KCkpXG5cdHZpdGVQbHVnaW5zLnB1c2goY3JlYXRlU2V0dXBFeHRlbmQoKSlcbiAgICB2aXRlUGx1Z2lucy5wdXNoKGNyZWF0ZVN2Z0ljb24oaXNCdWlsZCkpXG5cdGlzQnVpbGQgJiYgdml0ZVBsdWdpbnMucHVzaCguLi5jcmVhdGVDb21wcmVzc2lvbih2aXRlRW52KSlcbiAgICByZXR1cm4gdml0ZVBsdWdpbnNcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvY2FvbGVpL0Rlc2t0b3Avc3ByaW5nYm9vdC1sZ2cvcnVveWktdnVlLWxnZy1mcm9udGVuZC92aXRlL3BsdWdpbnMvYXV0by1pbXBvcnQuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS9wbHVnaW5zL2F1dG8taW1wb3J0LmpzXCI7aW1wb3J0IGF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQXV0b0ltcG9ydCgpIHtcbiAgICByZXR1cm4gYXV0b0ltcG9ydCh7XG4gICAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgICAgICd2dWUnLFxuICAgICAgICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgICAgICAgJ3BpbmlhJ1xuICAgICAgICBdLFxuICAgICAgICBkdHM6IGZhbHNlXG4gICAgfSlcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvY2FvbGVpL0Rlc2t0b3Avc3ByaW5nYm9vdC1sZ2cvcnVveWktdnVlLWxnZy1mcm9udGVuZC92aXRlL3BsdWdpbnMvc3ZnLWljb24uanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS9wbHVnaW5zL3N2Zy1pY29uLmpzXCI7aW1wb3J0IHsgY3JlYXRlU3ZnSWNvbnNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zdmctaWNvbnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTdmdJY29uKGlzQnVpbGQpIHtcbiAgICByZXR1cm4gY3JlYXRlU3ZnSWNvbnNQbHVnaW4oe1xuXHRcdGljb25EaXJzOiBbcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvYXNzZXRzL2ljb25zL3N2ZycpXSxcbiAgICAgICAgc3ltYm9sSWQ6ICdpY29uLVtkaXJdLVtuYW1lXScsXG4gICAgICAgIHN2Z29PcHRpb25zOiBpc0J1aWxkXG4gICAgfSlcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvY2FvbGVpL0Rlc2t0b3Avc3ByaW5nYm9vdC1sZ2cvcnVveWktdnVlLWxnZy1mcm9udGVuZC92aXRlL3BsdWdpbnMvY29tcHJlc3Npb24uanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS9wbHVnaW5zL2NvbXByZXNzaW9uLmpzXCI7aW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDb21wcmVzc2lvbihlbnYpIHtcbiAgICBjb25zdCB7IFZJVEVfQlVJTERfQ09NUFJFU1MgfSA9IGVudlxuICAgIGNvbnN0IHBsdWdpbiA9IFtdXG4gICAgaWYgKFZJVEVfQlVJTERfQ09NUFJFU1MpIHtcbiAgICAgICAgY29uc3QgY29tcHJlc3NMaXN0ID0gVklURV9CVUlMRF9DT01QUkVTUy5zcGxpdCgnLCcpXG4gICAgICAgIGlmIChjb21wcmVzc0xpc3QuaW5jbHVkZXMoJ2d6aXAnKSkge1xuICAgICAgICAgICAgLy8gaHR0cDovL2RvYy5ydW95aS52aXAvcnVveWktdnVlL290aGVyL2ZhcS5odG1sI1x1NEY3Rlx1NzUyOGd6aXBcdTg5RTNcdTUzOEJcdTdGMjlcdTk3NTlcdTYwMDFcdTY1ODdcdTRFRjZcbiAgICAgICAgICAgIHBsdWdpbi5wdXNoKFxuICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uKHtcbiAgICAgICAgICAgICAgICAgICAgZXh0OiAnLmd6JyxcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlT3JpZ2luRmlsZTogZmFsc2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21wcmVzc0xpc3QuaW5jbHVkZXMoJ2Jyb3RsaScpKSB7XG4gICAgICAgICAgICBwbHVnaW4ucHVzaChcbiAgICAgICAgICAgICAgICBjb21wcmVzc2lvbih7XG4gICAgICAgICAgICAgICAgICAgIGV4dDogJy5icicsXG4gICAgICAgICAgICAgICAgICAgIGFsZ29yaXRobTogJ2Jyb3RsaUNvbXByZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlT3JpZ2luRmlsZTogZmFsc2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwbHVnaW5cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2Nhb2xlaS9EZXNrdG9wL3NwcmluZ2Jvb3QtbGdnL3J1b3lpLXZ1ZS1sZ2ctZnJvbnRlbmQvdml0ZS9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvY2FvbGVpL0Rlc2t0b3Avc3ByaW5nYm9vdC1sZ2cvcnVveWktdnVlLWxnZy1mcm9udGVuZC92aXRlL3BsdWdpbnMvc2V0dXAtZXh0ZW5kLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9jYW9sZWkvRGVza3RvcC9zcHJpbmdib290LWxnZy9ydW95aS12dWUtbGdnLWZyb250ZW5kL3ZpdGUvcGx1Z2lucy9zZXR1cC1leHRlbmQuanNcIjtpbXBvcnQgc2V0dXBFeHRlbmQgZnJvbSAndW5wbHVnaW4tdnVlLXNldHVwLWV4dGVuZC1wbHVzL3ZpdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVNldHVwRXh0ZW5kKCkge1xuICAgIHJldHVybiBzZXR1cEV4dGVuZCh7fSlcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVcsU0FBUyxjQUFjLGVBQWU7QUFDelksT0FBT0EsV0FBVTs7O0FDRDZXLE9BQU8sU0FBUzs7O0FDQUosT0FBTyxnQkFBZ0I7QUFFbFosU0FBUixtQkFBb0M7QUFDdkMsU0FBTyxXQUFXO0FBQUEsSUFDZCxTQUFTO0FBQUEsTUFDTDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLElBQ0EsS0FBSztBQUFBLEVBQ1QsQ0FBQztBQUNMOzs7QUNYb1ksU0FBUyw0QkFBNEI7QUFDemEsT0FBTyxVQUFVO0FBRUYsU0FBUixjQUErQixTQUFTO0FBQzNDLFNBQU8scUJBQXFCO0FBQUEsSUFDOUIsVUFBVSxDQUFDLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyxzQkFBc0IsQ0FBQztBQUFBLElBQ3hELFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxFQUNqQixDQUFDO0FBQ0w7OztBQ1QwWSxPQUFPLGlCQUFpQjtBQUVuWixTQUFSLGtCQUFtQyxLQUFLO0FBQzNDLFFBQU0sRUFBRSxvQkFBb0IsSUFBSTtBQUNoQyxRQUFNLFNBQVMsQ0FBQztBQUNoQixNQUFJLHFCQUFxQjtBQUNyQixVQUFNLGVBQWUsb0JBQW9CLE1BQU0sR0FBRztBQUNsRCxRQUFJLGFBQWEsU0FBUyxNQUFNLEdBQUc7QUFFL0IsYUFBTztBQUFBLFFBQ0gsWUFBWTtBQUFBLFVBQ1IsS0FBSztBQUFBLFVBQ0wsa0JBQWtCO0FBQUEsUUFDdEIsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQ0EsUUFBSSxhQUFhLFNBQVMsUUFBUSxHQUFHO0FBQ2pDLGFBQU87QUFBQSxRQUNILFlBQVk7QUFBQSxVQUNSLEtBQUs7QUFBQSxVQUNMLFdBQVc7QUFBQSxVQUNYLGtCQUFrQjtBQUFBLFFBQ3RCLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFDQSxTQUFPO0FBQ1g7OztBQzNCNFksT0FBTyxpQkFBaUI7QUFFclosU0FBUixvQkFBcUM7QUFDeEMsU0FBTyxZQUFZLENBQUMsQ0FBQztBQUN6Qjs7O0FKR2UsU0FBUixrQkFBbUMsU0FBUyxVQUFVLE9BQU87QUFDaEUsUUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDO0FBQzFCLGNBQVksS0FBSyxpQkFBaUIsQ0FBQztBQUN0QyxjQUFZLEtBQUssa0JBQWtCLENBQUM7QUFDakMsY0FBWSxLQUFLLGNBQWMsT0FBTyxDQUFDO0FBQzFDLGFBQVcsWUFBWSxLQUFLLEdBQUcsa0JBQWtCLE9BQU8sQ0FBQztBQUN0RCxTQUFPO0FBQ1g7OztBRGRBLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsTUFBTSxRQUFRLE1BQU07QUFDakQsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQztBQUN2QyxRQUFNLEVBQUUsYUFBYSxJQUFJO0FBQ3pCLFNBQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlMLE1BQU0saUJBQWlCLGVBQWUsTUFBTTtBQUFBLElBQzVDLFNBQVMsa0JBQWtCLEtBQUssWUFBWSxPQUFPO0FBQUEsSUFDbkQsU0FBUztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUE7QUFBQSxRQUVMLEtBQUtDLE1BQUssUUFBUSxrQ0FBVyxJQUFJO0FBQUE7QUFBQSxRQUVqQyxLQUFLQSxNQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUE7QUFBQSxNQUVBLFlBQVksQ0FBQyxRQUFRLE9BQU8sT0FBTyxRQUFRLFFBQVEsU0FBUyxNQUFNO0FBQUEsSUFDcEU7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBO0FBQUEsUUFFTCxZQUFZO0FBQUEsVUFDVixRQUFRO0FBQUE7QUFBQSxVQUVSLGNBQWM7QUFBQSxVQUNkLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxjQUFjLEVBQUU7QUFBQSxRQUM1QztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNQLFNBQVM7QUFBQSxVQUNQO0FBQUEsWUFDRSxlQUFlO0FBQUEsWUFDZixRQUFRO0FBQUEsY0FDTixTQUFTLENBQUMsV0FBVztBQUNuQixvQkFBSSxPQUFPLFNBQVMsV0FBVztBQUM3Qix5QkFBTyxPQUFPO0FBQUEsZ0JBQ2hCO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAicGF0aCJdCn0K
