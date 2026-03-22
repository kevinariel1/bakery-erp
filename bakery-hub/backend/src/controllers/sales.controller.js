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

    let totalFlour = 0, totalSugar = 0, totalYeast = 0

    for (const item of items) {
      const prod = await client.query(
        'SELECT * FROM products WHERE name = $1', [item.product_name]
      )
      if (prod.rowCount === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: `Product not found: ${item.product_name}` })
      }
      const p = prod.rows[0]
      totalFlour += p.flour_needed * item.quantity
      totalSugar += p.sugar_needed * item.quantity
      totalYeast += p.yeast_needed * item.quantity

      await client.query(
        `INSERT INTO sales (product_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4)`,
        [item.product_name, item.quantity, p.price, p.price * item.quantity]
      )
    }

    const stock = await client.query(
      'SELECT name, quantity FROM ingredients WHERE name = ANY($1)',
      [['flour', 'sugar', 'yeast']]
    )
    const s = {}
    stock.rows.forEach(r => s[r.name] = parseFloat(r.quantity))

    if (s.flour < totalFlour || s.sugar < totalSugar || s.yeast < totalYeast) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Insufficient ingredients for this sale' })
    }

    await client.query(`UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'flour'`, [totalFlour])
    await client.query(`UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'sugar'`, [totalSugar])
    await client.query(`UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'yeast'`, [totalYeast])

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