import request from '@/utils/request'

export function getBusinessData(params) {
  return request({
    url: '/admin/workspace/businessData',
    method: 'get',
    params
  })
}

export function getOrderOverview() {
  return request({
    url: '/admin/workspace/overviewOrders',
    method: 'get'
  })
}

export function getFruitOverview() {
  return request({
    url: '/admin/workspace/overviewDishes',
    method: 'get'
  })
}

export function getFruitBoxOverview() {
  return request({
    url: '/admin/workspace/overviewSetmeals',
    method: 'get'
  })
}

export function getTurnoverStatistics(params) {
  return request({
    url: '/admin/report/turnoverStatistics',
    method: 'get',
    params
  })
}

export function getOrderStatistics(params) {
  return request({
    url: '/admin/report/ordersStatistics',
    method: 'get',
    params
  })
}

export function getSalesTop10(params) {
  return request({
    url: '/admin/report/top10',
    method: 'get',
    params
  })
}

export function getUserStatistics(params) {
  return request({
    url: '/admin/report/userStatistics',
    method: 'get',
    params
  })
}
