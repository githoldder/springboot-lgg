import request from '@/utils/request'

export function listOrder(query) {
  return request({
    url: '/admin/order/conditionSearch',
    method: 'get',
    params: query
  })
}

export function getOrderDetail(id) {
  return request({
    url: `/admin/order/details/${id}`,
    method: 'get'
  })
}

export function getOrderStatistics() {
  return request({
    url: '/admin/order/statistics',
    method: 'get'
  })
}

export function confirmOrder(data) {
  return request({
    url: '/admin/order/confirm',
    method: 'put',
    data
  })
}

export function rejectOrder(data) {
  return request({
    url: '/admin/order/rejection',
    method: 'put',
    data
  })
}

export function cancelOrder(data) {
  return request({
    url: '/admin/order/cancel',
    method: 'put',
    data
  })
}

export function deliverOrder(id) {
  return request({
    url: `/admin/order/delivery/${id}`,
    method: 'put'
  })
}

export function completeOrder(id) {
  return request({
    url: `/admin/order/complete/${id}`,
    method: 'put'
  })
}
