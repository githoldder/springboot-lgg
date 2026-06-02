import request from '@/utils/request'

export function pageFruit(query) {
  return request({
    url: '/admin/dish/page',
    method: 'get',
    params: query
  })
}

export function listFruit(query) {
  return request({
    url: '/admin/dish/list',
    method: 'get',
    params: query
  })
}

export function getFruit(id) {
  return request({
    url: `/admin/dish/${id}`,
    method: 'get'
  })
}

export function addFruit(data) {
  return request({
    url: '/admin/dish',
    method: 'post',
    data
  })
}

export function updateFruit(data) {
  return request({
    url: '/admin/dish',
    method: 'put',
    data
  })
}

export function deleteFruit(ids) {
  return request({
    url: '/admin/dish',
    method: 'delete',
    params: { ids }
  })
}

export function changeFruitStatus(id, status) {
  return request({
    url: `/admin/dish/status/${status}`,
    method: 'post',
    params: { id }
  })
}
