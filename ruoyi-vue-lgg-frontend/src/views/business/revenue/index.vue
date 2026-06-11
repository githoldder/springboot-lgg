<template>
  <div class="app-container revenue-page">
    <el-row :gutter="16">
      <el-col v-for="item in metrics" :key="item.label" :xs="24" :sm="12" :lg="6">
        <el-card class="metric-card">
          <div class="metric-label">{{ item.label }}</div>
          <div class="metric-value">{{ item.value }}</div>
          <div class="metric-note">{{ item.note }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>近 7 日营业额</span>
              <div>
                <el-button type="success" size="small" @click="handleExport">导出Excel</el-button>
                <el-button type="primary" size="small" @click="loadData">刷新</el-button>
              </div>
            </div>
          </template>
          <div ref="turnoverChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card>
          <template #header>热销水果 TOP 10</template>
          <el-table :data="topRows" height="300">
            <el-table-column label="排名" type="index" width="70" />
            <el-table-column label="商品" prop="name" min-width="160" />
            <el-table-column label="销量" prop="number" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { getBusinessData, getOrderStatistics, getSalesTop10, getTurnoverStatistics } from '@/api/business/dashboard'

const businessData = ref({})
const turnoverData = ref({ dateList: '', turnoverList: '' })
const orderData = ref({})
const topData = ref({ nameList: '', numberList: '' })
const turnoverChartRef = ref()
let turnoverChart
const { proxy } = getCurrentInstance()

const metrics = computed(() => [
  { label: '今日营业额', value: `¥${Number(businessData.value.turnover || 0).toFixed(2)}`, note: '来自工作台实时统计' },
  { label: '有效订单', value: `${businessData.value.validOrderCount || 0} 单`, note: `完成率 ${percent(businessData.value.orderCompletionRate)}` },
  { label: '客单价', value: `¥${Number(businessData.value.unitPrice || 0).toFixed(2)}`, note: '水果零售均单金额' },
  { label: '新增用户', value: `${businessData.value.newUsers || 0} 人`, note: `7 日订单 ${orderData.value.totalOrderCount || 0} 单` }
])

const topRows = computed(() => {
  const names = splitList(topData.value.nameList)
  const numbers = splitList(topData.value.numberList)
  return names.map((name, index) => ({ name, number: numbers[index] || 0 }))
})

function splitList(value) {
  return String(value || '').split(',').filter(Boolean)
}

function percent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`
}

function dateRange() {
  const end = new Date()
  const begin = new Date()
  begin.setDate(end.getDate() - 6)
  return {
    begin: begin.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  }
}

function renderChart() {
  if (!turnoverChartRef.value) return
  if (!turnoverChart) {
    turnoverChart = echarts.init(turnoverChartRef.value)
  }
  turnoverChart.setOption({
    color: ['#10b981'],
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 20, top: 28, bottom: 30 },
    xAxis: { type: 'category', data: splitList(turnoverData.value.dateList) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '营业额',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.14 },
        data: splitList(turnoverData.value.turnoverList).map(Number)
      }
    ]
  })
}

function loadData() {
  const range = dateRange()
  Promise.all([
    getBusinessData(),
    getTurnoverStatistics(range),
    getOrderStatistics(range),
    getSalesTop10(range)
  ]).then(([businessRes, turnoverRes, orderRes, topRes]) => {
    businessData.value = businessRes.data || {}
    turnoverData.value = turnoverRes.data || {}
    orderData.value = orderRes.data || {}
    topData.value = topRes.data || {}
    nextTick(renderChart)
  })
}

function handleExport() {
  proxy.download('admin/report/export', {}, `常工鲜生营业额报表_${dateRange().end}.xls`)
}

function resizeChart() {
  turnoverChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  turnoverChart?.dispose()
})
</script>

<style scoped>
.revenue-page {
  background: #f6f8fb;
  min-height: calc(100vh - 84px);
}

.metric-card {
  margin-bottom: 16px;
}

.metric-label {
  color: #667085;
  font-size: 13px;
}

.metric-value {
  color: #101828;
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0;
}

.metric-note {
  color: #98a2b3;
  font-size: 12px;
}

.chart-row {
  margin-top: 4px;
}

.card-header {
  align-items: center;
  display: flex;
  font-weight: 700;
  justify-content: space-between;
}

.chart {
  height: 300px;
}
</style>
