<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span>订单记录</span>
          <div>
            <el-button type="success" size="small" @click="handleExport">导出Excel</el-button>
            <el-button type="primary" size="small" @click="getList">刷新</el-button>
          </div>
        </div>
      </template>
      <el-table v-loading="loading" :data="orderList">
        <el-table-column label="订单号" align="center" prop="number" />
        <el-table-column label="收货人" align="center" prop="consignee" />
        <el-table-column label="手机号" align="center" prop="phone" />
        <el-table-column label="配送方式" align="center" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.deliveryType === 'PICKUP' ? 'warning' : 'success'">
              {{ scope.row.deliveryType === 'PICKUP' ? '到店自提' : '配送到家' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="骑手" align="center" min-width="120">
          <template #default="scope">
            {{ scope.row.riderName || '未指派' }}
          </template>
        </el-table-column>
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
        <el-table-column label="操作" align="center" width="360">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 2"
              type="primary"
              size="small"
              @click="handleConfirm(scope.row)"
            >接单</el-button>
            <el-button
              v-if="scope.row.status === 3 && scope.row.deliveryType !== 'PICKUP'"
              type="warning"
              size="small"
              @click="openAssignDialog(scope.row)"
            >指派骑手</el-button>
            <el-button
              v-if="scope.row.status === 3 && scope.row.deliveryType === 'PICKUP'"
              type="success"
              size="small"
              @click="handleComplete(scope.row)"
            >完成自提</el-button>
            <el-button
              v-if="scope.row.status === 4"
              type="success"
              size="small"
              @click="handleComplete(scope.row)"
            >完成</el-button>
            <el-button type="info" size="small" @click="handlePrint(scope.row)">小票</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="assignDialogVisible" title="指派骑手" width="420px">
      <el-form label-width="90px">
        <el-form-item label="订单号">
          <span>{{ currentOrder?.number }}</span>
        </el-form-item>
        <el-form-item label="骑手">
          <el-select v-model="selectedRiderId" placeholder="请选择骑手" style="width: 100%">
            <el-option
              v-for="rider in riderList"
              :key="rider.id"
              :label="`${rider.name} ${rider.phone || ''}`"
              :value="rider.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignRider">确认指派</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, onMounted, onBeforeUnmount } from 'vue'
import { listOrder, confirmOrder, completeOrder, assignRider, getOrderPrint } from '@/api/business/order'
import { pageEmployee } from '@/api/business/employee'
import { ElMessage, ElNotification } from 'element-plus'

const loading = ref(false)
const orderList = ref([])
const riderList = ref([])
const assignDialogVisible = ref(false)
const currentOrder = ref(null)
const selectedRiderId = ref(null)
const { proxy } = getCurrentInstance()
let orderNoticeSocket

function getList() {
  loading.value = true
  listOrder({ page: 1, pageSize: 100 }).then(res => {
    orderList.value = res.data?.records || []
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function getRiders() {
  pageEmployee({ page: 1, pageSize: 100 }).then(res => {
    const keywords = ['骑手', '配送', '调度', 'dispatcher']
    riderList.value = (res.data?.records || []).filter(item => {
      const text = `${item.name || ''}${item.username || ''}`.toLowerCase()
      return item.status === 1 && keywords.some(keyword => text.includes(keyword.toLowerCase()))
    })
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

function openAssignDialog(row) {
  currentOrder.value = row
  selectedRiderId.value = row.riderId || null
  assignDialogVisible.value = true
}

function handleAssignRider() {
  const rider = riderList.value.find(item => item.id === selectedRiderId.value)
  if (!rider) {
    ElMessage.warning('请选择骑手')
    return
  }
  assignRider({
    orderId: currentOrder.value.id,
    riderId: rider.id,
    riderName: rider.name,
    riderPhone: rider.phone
  }).then(() => {
    ElMessage.success('已指派骑手，订单进入配送中')
    assignDialogVisible.value = false
    getList()
  })
}

function handleComplete(row) {
  completeOrder(row.id).then(() => {
    ElMessage.success('订单已完成')
    getList()
  })
}

function handlePrint(row) {
  getOrderPrint(row.id).then(html => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      ElMessage.warning('浏览器阻止了打印窗口，请允许弹窗后重试')
      return
    }
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  })
}

function handleExport() {
  const date = new Date().toISOString().slice(0, 10)
  proxy.download('admin/order/export', {}, `常工鲜生订单记录_${date}.xls`)
}

let paySuccessSocket

function connectOrderNoticeSocket() {
  if (orderNoticeSocket && orderNoticeSocket.readyState <= WebSocket.OPEN) {
    return
  }
  const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const wsHost = window.location.hostname + ':8090';
  orderNoticeSocket = new WebSocket(`${wsProtocol}${wsHost}/ws/admin-order`)
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
  paySuccessSocket = new WebSocket(`${wsProtocol}${wsHost}/websocket/admin-order`)
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
  getList()
}

onMounted(() => {
  getList()
  getRiders()
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
.table-header {
  align-items: center;
  display: flex;
  font-weight: 700;
  justify-content: space-between;
}
</style>
