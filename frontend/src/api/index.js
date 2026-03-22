import client from './client.js'

export const inventoryApi = {
  getAll: () => client.get('/inventory'),
  restock: (name, amount) => client.post('/inventory/restock', { name, amount }),
  deduct: (flour, sugar, yeast) => client.post('/inventory/deduct', { flour, sugar, yeast })
}

export const productionApi = {
  getOrders: () => client.get('/production'),
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