<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span>员工管理</span>
          <el-button type="primary" size="small" @click="getList">刷新</el-button>
        </div>
      </template>
      <el-form :model="queryParams" inline>
        <el-form-item label="员工姓名">
          <el-input v-model="queryParams.name" placeholder="请输入员工姓名" clearable @keyup.enter="getList" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="employeeList">
        <el-table-column label="员工ID" align="center" prop="id" width="90" />
        <el-table-column label="登录账号" prop="username" min-width="130" />
        <el-table-column label="员工姓名" prop="name" min-width="130" />
        <el-table-column label="手机号" prop="phone" min-width="140" />
        <el-table-column label="性别" align="center" width="80">
          <template #default="scope">{{ scope.row.sex === '1' ? '女' : '男' }}</template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="120">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" min-width="180" />
      </el-table>
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { changeEmployeeStatus, pageEmployee } from '@/api/business/employee'

const loading = ref(false)
const total = ref(0)
const employeeList = ref([])
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: ''
})

function getList() {
  loading.value = true
  pageEmployee(queryParams).then(res => {
    employeeList.value = res.data?.records || []
    total.value = res.data?.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function resetQuery() {
  queryParams.name = ''
  queryParams.page = 1
  getList()
}

function handleStatusChange(row) {
  changeEmployeeStatus(row.id, row.status).then(() => {
    ElMessage.success(row.status === 1 ? '员工账号已启用' : '员工账号已禁用')
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
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
</style>
