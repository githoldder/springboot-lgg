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

    <!-- 4 Stats Cards -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div class="stat-item">
            <div class="stat-label" style="color: #636e72; font-size: 14px;">今日销售额</div>
            <div class="stat-value" style="font-size: 28px; font-weight: bold; color: #2d3436; margin: 10px 0;">
              ¥{{ businessData.turnover?.toFixed(2) || '0.00' }}
            </div>
            <div class="stat-trend" style="color: #00b894; font-size: 12px;">
              客单价: ¥{{ businessData.unitPrice?.toFixed(2) || '0.00' }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div class="stat-item">
            <div class="stat-label" style="color: #636e72; font-size: 14px;">今日生鲜订单</div>
            <div class="stat-value" style="font-size: 28px; font-weight: bold; color: #2d3436; margin: 10px 0;">
              {{ businessData.validOrderCount || 0 }} 单
            </div>
            <div class="stat-trend" style="color: #00b894; font-size: 12px;">
              订单完成率: {{ (businessData.orderCompletionRate * 100)?.toFixed(1) || '0.0' }}%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div class="stat-item">
            <div class="stat-label" style="color: #636e72; font-size: 14px;">新增会员客户</div>
            <div class="stat-value" style="font-size: 28px; font-weight: bold; color: #2d3436; margin: 10px 0;">
              {{ businessData.newUsers || 0 }} 人
            </div>
            <div class="stat-trend" style="color: #00b894; font-size: 12px;">
              今日实时增长
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div class="stat-item">
            <div class="stat-label" style="color: #636e72; font-size: 14px;">在售商品品种</div>
            <div class="stat-value" style="font-size: 28px; font-weight: bold; color: #2d3436; margin: 10px 0;">
              {{ fruitOverview.sold || 0 }} 种
            </div>
            <div class="stat-trend" style="color: #d63031; font-size: 12px;">
              已停售商品: {{ fruitOverview.discontinued || 0 }} 种
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row 1: Line Chart & Pie Chart -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #2d3436;">最近 7 天营业额走势</span>
              <el-button type="success" size="small" @click="handleExport">导出运营数据报表</el-button>
            </div>
          </template>
          <div ref="turnoverChartRef" style="height: 350px; width: 100%;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span style="font-weight: bold; color: #2d3436;">订单状态占比监控</span>
            </div>
          </template>
          <div ref="orderOverviewChartRef" style="height: 350px; width: 100%;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row 2: Bar Chart & Rank List -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span style="font-weight: bold; color: #2d3436;">热销生鲜销量排行 TOP 10</span>
            </div>
          </template>
          <div ref="salesTop10ChartRef" style="height: 380px; width: 100%;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" style="min-height: 440px;">
          <template #header>
            <div class="card-header">
              <span style="font-weight: bold; color: #2d3436;">今日热销精品水果 TOP 5</span>
            </div>
          </template>
          <div style="padding: 10px 0;">
            <div v-for="(item, index) in hotFruits" :key="index" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1px dashed #f1f2f6;">
              <div style="display: flex; align-items: center; width: 70%;">
                <span :style="getRankStyle(index)">{{ index + 1 }}</span>
                <span style="font-size: 14px; color: #2d3436; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ item.name }}</span>
              </div>
              <div style="font-size: 14px; font-weight: bold; color: #2d3436;">
                {{ item.number }} <span style="font-size: 12px; font-weight: normal; color: #636e72;">件</span>
              </div>
            </div>
            <div v-if="hotFruits.length === 0" style="text-align: center; color: #909399; padding: 40px 0;">
              今日暂无销售数据
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
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { ElNotification } from 'element-plus'
import * as echarts from 'echarts'
import {
  getBusinessData,
  getOrderOverview,
  getFruitOverview,
  getTurnoverStatistics,
  getSalesTop10
} from '@/api/business/dashboard.js'

const { proxy } = getCurrentInstance()

// Ref elements
const turnoverChartRef = ref(null)
const salesTop10ChartRef = ref(null)
const orderOverviewChartRef = ref(null)

// Chart instances
let turnoverChart = null
let salesTop10Chart = null
let orderOverviewChart = null

// Reactive data
const businessData = ref({
  turnover: 0,
  validOrderCount: 0,
  orderCompletionRate: 0,
  unitPrice: 0,
  newUsers: 0
})
const orderOverview = ref({
  waitingOrders: 0,
  deliveredOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  allOrders: 0
})
const fruitOverview = ref({
  sold: 0,
  discontinued: 0
})
const hotFruits = ref([])

// Dates
const getPastDateStr = (daysAgo) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
const begin = getPastDateStr(6)
const end = getPastDateStr(0)

const handleExport = () => {
  proxy.download('admin/report/export', {}, `常工鲜生营业额报表_${end}.xls`)
}

// WebSocket states
let orderNoticeSocket = null
let paySuccessSocket = null

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
    marginRight: '10px',
    flexShrink: 0
  }
  if (index === 0) return { ...base, backgroundColor: '#ff7675' }
  if (index === 1) return { ...base, backgroundColor: '#e67e22' }
  if (index === 2) return { ...base, backgroundColor: '#f1c40f' }
  return { ...base, backgroundColor: '#bdc3c7' }
}

const loadDashboardData = async () => {
  try {
    const [bizRes, orderRes, fruitRes] = await Promise.all([
      getBusinessData(),
      getOrderOverview(),
      getFruitOverview()
    ])
    if (bizRes.code === 1 && bizRes.data) {
      businessData.value = bizRes.data
    }
    if (orderRes.code === 1 && orderRes.data) {
      orderOverview.value = orderRes.data
      initOrderOverviewChart()
    }
    if (fruitRes.code === 1 && fruitRes.data) {
      fruitOverview.value = fruitRes.data
    }
  } catch (err) {
    console.error('Load dashboard metadata failed:', err)
  }
}

const loadChartsData = async () => {
  try {
    const [turnoverRes, top10Res] = await Promise.all([
      getTurnoverStatistics({ begin, end }),
      getSalesTop10({ begin, end })
    ])
    
    if (turnoverRes.code === 1 && turnoverRes.data) {
      initTurnoverChart(turnoverRes.data)
    }
    if (top10Res.code === 1 && top10Res.data) {
      const names = top10Res.data.nameList ? top10Res.data.nameList.split(',') : []
      const numbers = top10Res.data.numberList ? top10Res.data.numberList.split(',').map(Number) : []
      
      // Update Top 5 rank list
      hotFruits.value = names.slice(0, 5).map((name, i) => ({
        name,
        number: numbers[i] || 0
      }))
      
      initSalesTop10Chart(names, numbers)
    }
  } catch (err) {
    console.error('Load dashboard charts failed:', err)
  }
}

const initTurnoverChart = (data) => {
  if (!turnoverChartRef.value) return
  if (turnoverChart) turnoverChart.dispose()
  turnoverChart = echarts.init(turnoverChartRef.value)
  const dates = data.dateList ? data.dateList.split(',') : []
  const values = data.turnoverList ? data.turnoverList.split(',').map(Number) : []
  
  turnoverChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: '{b} <br/>营业额: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: { color: '#636e72' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#636e72', formatter: '¥{value}' }
    },
    series: [
      {
        name: '营业额',
        type: 'line',
        smooth: true,
        data: values,
        itemStyle: { color: '#00b894' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 184, 148, 0.4)' },
            { offset: 1, color: 'rgba(0, 184, 148, 0.0)' }
          ])
        }
      }
    ]
  })
}

const initSalesTop10Chart = (names, numbers) => {
  if (!salesTop10ChartRef.value) return
  if (salesTop10Chart) salesTop10Chart.dispose()
  salesTop10Chart = echarts.init(salesTop10ChartRef.value)
  
  salesTop10Chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#636e72' }
    },
    yAxis: {
      type: 'category',
      data: names.slice(0, 10).reverse(),
      axisLabel: {
        color: '#2d3436',
        formatter: (val) => val.length > 8 ? val.substring(0, 8) + '...' : val
      }
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: numbers.slice(0, 10).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#55efc4' },
            { offset: 1, color: '#0984e3' }
          ])
        },
        label: {
          show: true,
          position: 'right',
          color: '#2d3436'
        }
      }
    ]
  })
}

const initOrderOverviewChart = () => {
  if (!orderOverviewChartRef.value) return
  if (orderOverviewChart) orderOverviewChart.dispose()
  orderOverviewChart = echarts.init(orderOverviewChartRef.value)
  
  const data = [
    { value: orderOverview.value.pendingPaymentOrders || 0, name: '待付款', itemStyle: { color: '#a29bfe' } },
    { value: orderOverview.value.waitingOrders || 0, name: '待接单', itemStyle: { color: '#ff7675' } },
    { value: orderOverview.value.acceptedOrders || 0, name: '已接单', itemStyle: { color: '#ffeaa7' } },
    { value: orderOverview.value.deliveredOrders || 0, name: '派送中', itemStyle: { color: '#0984e3' } },
    { value: orderOverview.value.completedOrders || 0, name: '已完成', itemStyle: { color: '#00b894' } },
    { value: orderOverview.value.cancelledOrders || 0, name: '已取消', itemStyle: { color: '#bdc3c7' } },
    { value: orderOverview.value.refundedOrders || 0, name: '已退款', itemStyle: { color: '#d63031' } }
  ].filter(item => item.value > 0)
  
  if (data.length === 0) {
    data.push({ value: 1, name: '暂无数据', itemStyle: { color: '#dfe6e9' } })
  }
  
  orderOverviewChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}单 ({d}%)'
    },
    legend: {
      bottom: '0',
      left: 'center',
      textStyle: { color: '#2d3436' }
    },
    series: [
      {
        name: '订单分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  })
}

// WebSocket connection
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
  // Reload metadata on new orders
  loadDashboardData()
  loadChartsData()
}

const handleResize = () => {
  if (turnoverChart) turnoverChart.resize()
  if (salesTop10Chart) salesTop10Chart.resize()
  if (orderOverviewChart) orderOverviewChart.resize()
}

onMounted(() => {
  loadDashboardData()
  loadChartsData()
  connectOrderNoticeSocket()
  connectPaySuccessSocket()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (orderNoticeSocket) {
    orderNoticeSocket.close()
    orderNoticeSocket = undefined
  }
  if (paySuccessSocket) {
    paySuccessSocket.close()
    paySuccessSocket = undefined
  }
  if (turnoverChart) turnoverChart.dispose()
  if (salesTop10Chart) salesTop10Chart.dispose()
  if (orderOverviewChart) orderOverviewChart.dispose()
})
</script>

<style scoped>
.welcome-card {
  border: none;
  border-radius: 8px;
}
</style>
