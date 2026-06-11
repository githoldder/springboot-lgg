import request from '@/utils/request'

export function pageEmployee(query) {
  return request({
    url: '/admin/employee/page',
    method: 'get',
    params: query
  })
}

export function changeEmployeeStatus(id, status) {
  return request({
    url: `/admin/employee/status/${status}`,
    method: 'post',
    params: { id }
  })
}
