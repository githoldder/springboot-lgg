<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span>骑手管理</span>
          <el-button type="primary" size="small" @click="getList">刷新</el-button>
        </div>
      </template>
      <el-alert
        title="骑手档案来自员工表，当前按姓名/账号中包含“骑手、配送、调度、dispatcher”的人员归类。"
        type="info"
        show-icon
        :closable="false"
        class="hint"
      />
      <el-table v-loading="loading" :data="riderList">
        <el-table-column label="骑手ID" align="center" prop="id" width="90" />
        <el-table-column label="账号" prop="username" min-width="130" />
        <el-table-column label="姓名" prop="name" min-width="130" />
        <el-table-column label="手机号" prop="phone" min-width="140" />
        <el-table-column label="状态" align="center" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '可调度' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="配送能力" align="center" width="140">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'primary' : 'info'">
              {{ scope.row.status === 1 ? '同城即时配送' : '不可派单' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { pageEmployee } from '@/api/business/employee'

const loading = ref(false)
const employeeList = ref([])
const riderList = computed(() => {
  const keywords = ['骑手', '配送', '调度', 'dispatcher']
  return employeeList.value.filter(item => {
    const text = `${item.name || ''}${item.username || ''}`.toLowerCase()
    return keywords.some(keyword => text.includes(keyword.toLowerCase()))
  })
})

function getList() {
  loading.value = true
  pageEmployee({ page: 1, pageSize: 100 }).then(res => {
    employeeList.value = res.data?.records || []
  }).finally(() => {
    loading.value = false
  })
}

onMounted(getList)
</script>

<style scoped>
.table-header {
  align-items: center;
  display: flex;
  font-weight: 700;
  justify-content: space-between;
}

.hint {
  margin-bottom: 16px;
}
</style>
