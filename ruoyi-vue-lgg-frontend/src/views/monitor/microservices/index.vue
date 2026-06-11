<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span>微服务健康管理</span>
          <div>
            <span class="checked-time">最近检测：{{ status.checkedAt || '-' }}</span>
            <el-button type="primary" size="small" :loading="loading" @click="loadStatus">重新检测</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="16" class="summary-row">
        <el-col :xs="24" :sm="8">
          <el-card shadow="never">
            <div class="metric-label">微服务</div>
            <div class="metric-value">{{ healthyCount(status.services) }}/{{ status.services?.length || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card shadow="never">
            <div class="metric-label">基础依赖</div>
            <div class="metric-value">{{ healthyCount(status.dependencies) }}/{{ status.dependencies?.length || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card shadow="never">
            <div class="metric-label">网关路由测试</div>
            <div class="metric-value">{{ healthyCount(status.routeTests) }}/{{ status.routeTests?.length || 0 }}</div>
          </el-card>
        </el-col>
      </el-row>

      <section class="service-section">
        <h3>微服务实例</h3>
        <health-table :rows="status.services || []" />
      </section>
      <section class="service-section">
        <h3>基础依赖</h3>
        <health-table :rows="status.dependencies || []" />
      </section>
      <section class="service-section">
        <h3>接口路由测试</h3>
        <health-table :rows="status.routeTests || []" />
      </section>
    </el-card>
  </div>
</template>

<script setup>
import { defineComponent, h, onMounted, ref, resolveComponent } from 'vue'
import { ElTag } from 'element-plus'
import { getMicroserviceStatus } from '@/api/monitor/microservices'

const loading = ref(false)
const status = ref({})

const HealthTable = defineComponent({
  props: {
    rows: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const ElTable = resolveComponent('el-table')
    const ElTableColumn = resolveComponent('el-table-column')
    return () => h(ElTable, { data: props.rows, border: true }, {
      default: () => [
        h(ElTableColumn, { label: '名称', prop: 'label', minWidth: 160 }),
        h(ElTableColumn, { label: '状态', width: 110, align: 'center' }, {
          default: ({ row }) => h(ElTag, { type: row.healthy ? 'success' : 'danger' }, () => row.healthy ? '正常' : '异常')
        }),
        h(ElTableColumn, { label: '延迟(ms)', prop: 'latencyMs', width: 110, align: 'center' }),
        h(ElTableColumn, { label: '接口/地址', prop: 'endpoint', minWidth: 260 }),
        h(ElTableColumn, { label: '返回信息', prop: 'message', minWidth: 280 })
      ]
    })
  }
})

function healthyCount(rows = []) {
  return rows.filter(item => item.healthy).length
}

function loadStatus() {
  loading.value = true
  getMicroserviceStatus().then(res => {
    status.value = res.data || {}
  }).finally(() => {
    loading.value = false
  })
}

onMounted(loadStatus)
</script>

<style scoped>
.table-header {
  align-items: center;
  display: flex;
  font-weight: 700;
  justify-content: space-between;
}

.checked-time {
  color: #667085;
  font-size: 12px;
  margin-right: 12px;
}

.summary-row {
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
  margin-top: 6px;
}

.service-section {
  margin-top: 18px;
}

.service-section h3 {
  color: #344054;
  font-size: 15px;
  margin: 0 0 10px;
}
</style>
