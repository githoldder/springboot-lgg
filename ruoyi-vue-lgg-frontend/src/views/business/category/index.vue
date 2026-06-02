<template>
  <div class="app-container">
    <el-card>
      <el-table v-loading="loading" :data="categoryList">
        <el-table-column label="分类ID" align="center" prop="id" />
        <el-table-column label="分类名称" align="center" prop="name" />
        <el-table-column label="类型" align="center" prop="type">
          <template #default="scope">
            <el-tag :type="scope.row.type === 1 ? 'success' : 'warning'">
              {{ scope.row.type === 1 ? '水果单品' : '果篮套餐' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sort" />
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
import { listCategory, changeCategoryStatus } from '@/api/business/category'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const categoryList = ref([])

function getList() {
  loading.value = true
  listCategory().then(res => {
    categoryList.value = res.data || []
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleStatusChange(row) {
  changeCategoryStatus(row.id, row.status).then(() => {
    ElMessage.success('修改成功')
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
  })
}

onMounted(() => {
  getList()
})
</script>
