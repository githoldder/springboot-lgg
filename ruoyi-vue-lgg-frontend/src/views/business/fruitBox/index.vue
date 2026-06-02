<template>
  <div class="app-container">
    <el-card>
      <el-table v-loading="loading" :data="fruitBoxList">
        <el-table-column label="套餐ID" align="center" prop="id" />
        <el-table-column label="图片" align="center" width="100">
          <template #default="scope">
            <el-image :src="scope.row.image" fit="cover" style="width: 50px; height: 50px; border-radius: 5px" />
          </template>
        </el-table-column>
        <el-table-column label="果篮套餐名称" align="center" prop="name" />
        <el-table-column label="套餐价格" align="center" prop="price">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pageFruitBox, changeFruitBoxStatus } from '@/api/business/fruitBox'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const fruitBoxList = ref([])

function getList() {
  loading.value = true
  pageFruitBox({ page: 1, pageSize: 100 }).then(res => {
    fruitBoxList.value = res.data?.records || []
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleStatusChange(row) {
  changeFruitBoxStatus(row.id, row.status).then(() => {
    ElMessage.success('修改成功')
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
  })
}

onMounted(() => {
  getList()
})
</script>
