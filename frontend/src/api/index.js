import client from './client.js'

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  me: () => client.get('/auth/me'),
  getUsers: () => client.get('/auth/users'),
  register: (data) => client.post('/auth/register', data)
}

export const inventoryApi = {
  getAll: () => client.get('/inventory'),
  restock: (name, amount) => client.post('/inventory/restock', { name, amount }),
}

export const productionApi = {
  getOrders: () => client.get('/production'),
  getFinishedGoods: () => client.get('/production/finished-goods'),
  addOrder: (product_name, quantity_ordered) =>
    client.post('/production', { product_name, quantity_ordered }),
  bake: (id, amount) => client.patch(`/production/${id}/bake`, { amount })
}

export const salesApi = {
  getProducts: () => client.get('/sales/products'),
  getSales: () => client.get('/sales'),
  getRevenue: () => client.get('/sales/revenue'),
  createSale: (items) => client.post('/sales', { items })
}