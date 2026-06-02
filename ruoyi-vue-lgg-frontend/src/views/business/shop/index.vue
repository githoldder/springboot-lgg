<template>
  <div class="app-container">
    <el-card style="max-width: 600px; margin: 20px auto; text-align: center;">
      <template #header>
        <div class="card-header">
          <span>绿果果店铺营业状态设置</span>
        </div>
      </template>
      <div style="padding: 40px 0;">
        <el-result
          :icon="status === 1 ? 'success' : 'warning'"
          :title="status === 1 ? '营业中' : '打烊中'"
          :sub-title="status === 1 ? '店铺正在营业，C端用户可正常下单购买新鲜水果！' : '店铺已打烊，C端用户目前无法下单！'"
        >
          <template #extra>
            <el-switch
              v-model="status"
              :active-value="1"
              :inactive-value="0"
              active-text="营业"
              inactive-text="打烊"
              size="large"
              style="--el-switch-on-color: #00b894"
              @change="handleStatusChange"
            />
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getShopStatus, updateShopStatus } from '@/api/business/shop'
import { ElMessage } from 'element-plus'

const status = ref(1)

function getStatus() {
  getShopStatus().then(res => {
    status.value = res.data
  })
}

function handleStatusChange(val) {
  updateShopStatus(val).then(() => {
    ElMessage.success(val === 1 ? '店铺已设置为营业状态' : '店铺已设置为打烊状态')
    getStatus()
  }).catch(() => {
    status.value = val === 1 ? 0 : 1
  })
}

onMounted(() => {
  getStatus()
})
</script>
