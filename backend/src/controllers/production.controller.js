import pool from '../db/pool.js'

export const getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM production_orders
       WHERE due_date = CURRENT_DATE
       ORDER BY created_at DESC`
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
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const orderRes = await client.query(
      'SELECT * FROM production_orders WHERE id = $1', [id]
    )
    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orderRes.rows[0]
    const remaining = order.quantity_ordered - order.quantity_done
    const actual = Math.min(amount, remaining)

    if (actual <= 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Order already fully baked' })
    }

    const productRes = await client.query(
      'SELECT * FROM products WHERE name = $1', [order.product_name]
    )
    if (productRes.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Product recipe not found' })
    }

    const recipe = productRes.rows[0]
    const flourNeeded = parseFloat(recipe.flour_needed) * actual
    const sugarNeeded = parseFloat(recipe.sugar_needed) * actual
    const yeastNeeded = parseFloat(recipe.yeast_needed) * actual

    const stockRes = await client.query(
      'SELECT name, quantity FROM ingredients WHERE name = ANY($1)',
      [['flour', 'sugar', 'yeast']]
    )
    const stock = {}
    stockRes.rows.forEach(r => stock[r.name] = parseFloat(r.quantity))

    if (stock.flour < flourNeeded) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        error: `Not enough flour. Need ${flourNeeded.toFixed(2)}kg, have ${stock.flour.toFixed(2)}kg`
      })
    }
    if (stock.sugar < sugarNeeded) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        error: `Not enough sugar. Need ${sugarNeeded.toFixed(2)}kg, have ${stock.sugar.toFixed(2)}kg`
      })
    }
    if (stock.yeast < yeastNeeded) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        error: `Not enough yeast. Need ${yeastNeeded.toFixed(3)}kg, have ${stock.yeast.toFixed(3)}kg`
      })
    }

    await client.query(
      `UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'flour'`,
      [flourNeeded]
    )
    await client.query(
      `UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'sugar'`,
      [sugarNeeded]
    )
    await client.query(
      `UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'yeast'`,
      [yeastNeeded]
    )

    await client.query(
      `UPDATE finished_goods
       SET quantity = quantity + $1, updated_at = NOW()
       WHERE product_name = $2`,
      [actual, order.product_name]
    )

    const updated = await client.query(
      `UPDATE production_orders
       SET quantity_done = quantity_done + $1
       WHERE id = $2 RETURNING *`,
      [actual, id]
    )

    await client.query('COMMIT')
    res.json(updated.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

export const getFinishedGoods = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM finished_goods ORDER BY product_name'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}