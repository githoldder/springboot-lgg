import request from '@/utils/request'

export function listCategory(query) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params: query
  })
}

export function pageCategory(query) {
  return request({
    url: '/admin/category/page',
    method: 'get',
    params: query
  })
}

export function addCategory(data) {
  return request({
    url: '/admin/category',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: '/admin/category',
    method: 'put',
    data
  })
}

export function deleteCategory(ids) {
  return request({
    url: '/admin/category',
    method: 'delete',
    params: { ids }
  })
}

export function changeCategoryStatus(id, status) {
  return request({
    url: `/admin/category/status/${status}`,
    method: 'post',
    params: { id }
  })
}
