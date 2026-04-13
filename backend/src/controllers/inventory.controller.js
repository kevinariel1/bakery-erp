import pool from '../db/pool.js'

export const getIngredients = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ingredients ORDER BY id'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('getIngredients error:', err)
    res.status(500).json({ error: err.message })
  }
}

export const restockIngredient = async (req, res) => {
  const { name, amount } = req.body
  if (!name || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid name or amount' })
  }
  try {
    const result = await pool.query(
      `UPDATE ingredients
       SET quantity = LEAST(quantity + $1, max_quantity),
           updated_at = NOW()
       WHERE name = $2
       RETURNING *`,
      [amount, name]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ingredient not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('restockIngredient error:', err)
    res.status(500).json({ error: err.message })
  }
}

export const deductIngredients = async (req, res) => {
  const { flour, sugar, yeast } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const check = await client.query(
      'SELECT name, quantity FROM ingredients WHERE name = ANY($1)',
      [['flour', 'sugar', 'yeast']]
    )

    const stock = {}
    check.rows.forEach(r => stock[r.name] = parseFloat(r.quantity))

    if (stock.flour < flour || stock.sugar < sugar || stock.yeast < yeast) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Insufficient ingredients' })
    }

    await client.query(
      `UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'flour'`, [flour]
    )
    await client.query(
      `UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'sugar'`, [sugar]
    )
    await client.query(
      `UPDATE ingredients SET quantity = quantity - $1, updated_at = NOW() WHERE name = 'yeast'`, [yeast]
    )

    await client.query('COMMIT')
    res.json({ message: 'Ingredients deducted successfully' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('deductIngredients error:', err)
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}