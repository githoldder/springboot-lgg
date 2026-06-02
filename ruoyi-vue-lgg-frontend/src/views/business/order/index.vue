<template>
  <div class="app-container">
    <el-card>
      <el-table v-loading="loading" :data="orderList">
        <el-table-column label="订单号" align="center" prop="number" />
        <el-table-column label="收货人" align="center" prop="consignee" />
        <el-table-column label="手机号" align="center" prop="phone" />
        <el-table-column label="金额" align="center" prop="amount">
          <template #default="scope">
            ¥{{ scope.row.amount }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" align="center" prop="orderTime" />
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 2"
              type="primary"
              size="small"
              @click="handleConfirm(scope.row)"
            >接单</el-button>
            <el-button
              v-if="scope.row.status === 3"
              type="success"
              size="small"
              @click="handleDeliver(scope.row)"
            >配送</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listOrder, confirmOrder, deliverOrder } from '@/api/business/order'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const orderList = ref([])

function getList() {
  loading.value = true
  listOrder({ page: 1, pageSize: 100 }).then(res => {
    orderList.value = res.data?.records || []
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function getStatusLabel(status) {
  const map = { 1: '待付款', 2: '待接单', 3: '已接单', 4: '派送中', 5: '已完成', 6: '已取消', 7: '退款' }
  return map[status] || '未知'
}

function getStatusType(status) {
  const map = { 1: 'info', 2: 'danger', 3: 'warning', 4: 'primary', 5: 'success', 6: 'info', 7: 'danger' }
  return map[status] || 'info'
}

function handleConfirm(row) {
  confirmOrder({ id: row.id, status: 3 }).then(() => {
    ElMessage.success('接单成功')
    getList()
  })
}

function handleDeliver(row) {
  deliverOrder(row.id).then(() => {
    ElMessage.success('开始配送')
    getList()
  })
}

onMounted(() => {
  getList()
})
</script>
