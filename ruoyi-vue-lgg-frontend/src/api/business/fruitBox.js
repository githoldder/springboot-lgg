import request from '@/utils/request'

export function pageFruitBox(query) {
  return request({
    url: '/admin/setmeal/page',
    method: 'get',
    params: query
  })
}

export function getFruitBox(id) {
  return request({
    url: `/admin/setmeal/${id}`,
    method: 'get'
  })
}

export function addFruitBox(data) {
  return request({
    url: '/admin/setmeal',
    method: 'post',
    data
  })
}

export function updateFruitBox(data) {
  return request({
    url: '/admin/setmeal',
    method: 'put',
    data
  })
}

export function deleteFruitBox(ids) {
  return request({
    url: '/admin/setmeal',
    method: 'delete',
    params: { ids }
  })
}

export function changeFruitBoxStatus(id, status) {
  return request({
    url: `/admin/setmeal/status/${status}`,
    method: 'post',
    params: { id }
  })
}
