import request from '@/utils/request'

export function getMicroserviceStatus() {
  return request({
    url: '/monitor/microservices/status',
    method: 'get'
  })
}
