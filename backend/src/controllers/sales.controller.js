import pool from '../db/pool.js'

export const getSales = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sales ORDER BY sold_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getTodayRevenue = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(total_price), 0) AS revenue,
         COUNT(*) AS transactions
       FROM sales
       WHERE sold_at::date = CURRENT_DATE`
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createSale = async (req, res) => {
  const { items } = req.body
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in sale' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    for (const item of items) {
      const goodsRes = await client.query(
        'SELECT * FROM finished_goods WHERE product_name = $1',
        [item.product_name]
      )

      if (goodsRes.rowCount === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: `Product not found: ${item.product_name}` })
      }

      const good = goodsRes.rows[0]
      if (good.quantity < item.quantity) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          error: `Not enough ${item.product_name} baked. In stock: ${good.quantity}, requested: ${item.quantity}`
        })
      }

      const prodRes = await client.query(
        'SELECT price FROM products WHERE name = $1', [item.product_name]
      )
      if (prodRes.rowCount === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: `Price not found for: ${item.product_name}` })
      }

      const price = parseFloat(prodRes.rows[0].price)

      await client.query(
        `UPDATE finished_goods
         SET quantity = quantity - $1, updated_at = NOW()
         WHERE product_name = $2`,
        [item.quantity, item.product_name]
      )

      await client.query(
        `INSERT INTO sales (product_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4)`,
        [item.product_name, item.quantity, price, price * item.quantity]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ message: 'Sale completed', items_sold: items.length })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

export const getProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}