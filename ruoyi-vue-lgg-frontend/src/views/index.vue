<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card" style="margin-bottom: 20px; background: linear-gradient(135deg, #00b894, #55efc4); color: white;">
          <h2 style="margin: 0 0 10px 0;">欢迎使用 常工鲜生水果零售配送管理系统</h2>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            基于 Spring Boot 与 Vue3 + Element Plus 的新一代生鲜水果零售配送平台。
          </p>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div class="stat-item">
            <div class="stat-label" style="color: #636e72; font-size: 14px;">今日销售额</div>
            <div class="stat-value" style="font-size: 28px; font-weight: bold; color: #2d3436; margin: 10px 0;">¥2,480.50</div>
            <div class="stat-trend" style="color: #00b894; font-size: 12px;">较昨日 +12.5% ↑</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div class="stat-item">
            <div class="stat-label" style="color: #636e72; font-size: 14px;">今日生鲜订单</div>
            <div class="stat-value" style="font-size: 28px; font-weight: bold; color: #2d3436; margin: 10px 0;">35 单</div>
            <div class="stat-trend" style="color: #00b894; font-size: 12px;">已完成 28 单 (80%)</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div class="stat-item">
            <div class="stat-label" style="color: #636e72; font-size: 14px;">新增会员客户</div>
            <div class="stat-value" style="font-size: 28px; font-weight: bold; color: #2d3436; margin: 10px 0;">12 人</div>
            <div class="stat-trend" style="color: #00b894; font-size: 12px;">较昨日 +20.0% ↑</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div class="stat-item">
            <div class="stat-label" style="color: #636e72; font-size: 14px;">在售商品品种</div>
            <div class="stat-value" style="font-size: 28px; font-weight: bold; color: #2d3436; margin: 10px 0;">18 种</div>
            <div class="stat-trend" style="color: #00b894; font-size: 12px;">绿色健康生鲜标准</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" style="margin-bottom: 20px; min-height: 380px;">
          <template #header>
            <div class="card-header">
              <span style="font-weight: bold; color: #2d3436;">生鲜订单状态监控</span>
            </div>
          </template>
          <div style="padding: 10px 0;">
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #2d3436;">
                <span>待接单订单 (待审单处理)</span>
                <span>5 单 / 占比 14%</span>
              </div>
              <el-progress :percentage="14" status="exception" color="#ff7675" :stroke-width="12" />
            </div>
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #2d3436;">
                <span>待包装生鲜 (商家精细打包中)</span>
                <span>8 单 / 占比 23%</span>
              </div>
              <el-progress :percentage="23" color="#ffeaa7" :stroke-width="12" />
            </div>
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #2d3436;">
                <span>配送中订单 (骑手正极速送达)</span>
                <span>12 单 / 占比 34%</span>
              </div>
              <el-progress :percentage="34" color="#0984e3" :stroke-width="12" />
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #2d3436;">
                <span>已交付订单 (客户已签收商品)</span>
                <span>10 单 / 占比 29%</span>
              </div>
              <el-progress :percentage="29" status="success" color="#00b894" :stroke-width="12" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" style="margin-bottom: 20px; min-height: 380px;">
          <template #header>
            <div class="card-header">
              <span style="font-weight: bold; color: #2d3436;">今日热销精品水果 TOP 5</span>
            </div>
          </template>
          <div style="padding: 10px 0;">
            <div v-for="(item, index) in hotFruits" :key="index" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1px dashed #f1f2f6;">
              <div style="display: flex; align-items: center;">
                <span :style="getRankStyle(index)">{{ index + 1 }}</span>
                <span style="font-size: 14px; color: #2d3436;">{{ item.name }}</span>
              </div>
              <div style="font-size: 14px; font-weight: bold; color: #2d3436;">
                ¥{{ item.sales }} <span style="font-size: 12px; font-weight: normal; color: #636e72;">/ {{ item.unit }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span style="font-weight: bold; color: #2d3436;">关于 常工鲜生水果零售配送系统</span>
            </div>
          </template>
          <p style="font-size: 14px; line-height: 1.8; color: #2d3436; margin: 0;">
            “常工鲜生生鲜零售配送系统”是针对现代生鲜水果零售市场打造的高效、轻量、高可用业务运营平台。系统采用最新的 Spring Boot + Vue3/Vite + Element Plus 架构，底层业务数据库全面融入统一权限与安全机制。小程序端与管理端利用 WebSocket、沙箱模拟收银台无缝打通了从“用户选购”、“模拟支付”到“后台语音播报”、“商家精细包装”、“骑手快速送达”的全链路闭环流转，实现生鲜水果的极速配送与精细化运营。
          </p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ElNotification } from 'element-plus'
import { onBeforeUnmount, onMounted } from 'vue'

const hotFruits = [
  { name: '泰国金枕榴莲(约2.5kg)', sales: '1,580.00', unit: '10箱' },
  { name: '智利进口车厘子(500g)', sales: '998.00', unit: '20份' },
  { name: '精品红颜草莓(250g)', sales: '540.00', unit: '30盒' },
  { name: '海南贵妃芒果(500g)', sales: '375.00', unit: '30份' },
  { name: '阿克苏苹果(500g)', sales: '264.00', unit: '30包' }
]

function getRankStyle(index) {
  const base = {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    lineHeight: '20px',
    textAlign: 'center',
    borderRadius: '50%',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    marginRight: '10px'
  }
  if (index === 0) return { ...base, backgroundColor: '#ff7675' }
  if (index === 1) return { ...base, backgroundColor: '#e67e22' }
  if (index === 2) return { ...base, backgroundColor: '#f1c40f' }
  return { ...base, backgroundColor: '#bdc3c7' }
}

let orderNoticeSocket
let paySuccessSocket

function connectOrderNoticeSocket() {
  if (orderNoticeSocket && orderNoticeSocket.readyState <= WebSocket.OPEN) {
    return
  }
  const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const wsHost = window.location.hostname + ':8090';
  orderNoticeSocket = new WebSocket(`${wsProtocol}${wsHost}/ws/admin-dashboard`)
  orderNoticeSocket.onmessage = handleWebSocketMessage
  orderNoticeSocket.onerror = () => {
    if (orderNoticeSocket) orderNoticeSocket.close()
  }
}

function connectPaySuccessSocket() {
  if (paySuccessSocket && paySuccessSocket.readyState <= WebSocket.OPEN) {
    return
  }
  const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const wsHost = window.location.hostname + ':8090';
  paySuccessSocket = new WebSocket(`${wsProtocol}${wsHost}/websocket/admin-dashboard`)
  paySuccessSocket.onmessage = handleWebSocketMessage
  paySuccessSocket.onerror = () => {
    if (paySuccessSocket) paySuccessSocket.close()
  }
}

function handleWebSocketMessage(event) {
  let content = event.data
  try {
    const payload = JSON.parse(event.data)
    content = payload.content || event.data
  } catch (error) {
    content = event.data
  }
  ElNotification({
    title: '新订单提醒',
    message: content,
    type: 'success',
    duration: 9000
  })
}

onMounted(() => {
  connectOrderNoticeSocket()
  connectPaySuccessSocket()
})

onBeforeUnmount(() => {
  if (orderNoticeSocket) {
    orderNoticeSocket.close()
    orderNoticeSocket = undefined
  }
  if (paySuccessSocket) {
    paySuccessSocket.close()
    paySuccessSocket = undefined
  }
})
</script>

<style scoped>
.welcome-card {
  border: none;
  border-radius: 8px;
}
</style>
