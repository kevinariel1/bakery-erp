import pool from '../db/pool.js'

export const getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM production_orders ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const addOrder = async (req, res) => {
  const { product_name, quantity_ordered } = req.body
  if (!product_name || !quantity_ordered || quantity_ordered < 1) {
    return res.status(400).json({ error: 'Invalid order data' })
  }
  try {
    const result = await pool.query(
      `INSERT INTO production_orders (product_name, quantity_ordered)
       VALUES ($1, $2) RETURNING *`,
      [product_name, quantity_ordered]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateBaked = async (req, res) => {
  const { id } = req.params
  const { amount } = req.body
  try {
    const result = await pool.query(
      `UPDATE production_orders
       SET quantity_done = LEAST(quantity_done + $1, quantity_ordered)
       WHERE id = $2 RETURNING *`,
      [amount, id]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}   