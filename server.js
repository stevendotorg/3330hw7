require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/', async (req, res) => {
    try {
        // Pagination math for Query #2 (10 customers per page)
        const limit = 10;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const offset = (page - 1) * limit;

        // Run all 10 required queries
        const customerCountRes = await pool.query('SELECT count(*) FROM customers'); // 1
        const customersRes = await pool.query(
            'SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2',
            [limit, offset]
        ); // 2
        const revenueRes = await pool.query('SELECT sum(saleamount) FROM sales'); // 3
        const salesRes = await pool.query(`
            SELECT products.name, sales.quantity, sales.saleamount
            FROM sales
            LEFT JOIN products ON sales.productid = products.id
            ORDER BY sales.id ASC
        `); // 4
        const ordersCountRes = await pool.query('SELECT count(quantity) FROM orders'); // 5
        const issuesCountRes = await pool.query("SELECT count(id) FROM alerts WHERE type = 'issues'"); // 6
        const issuesListRes = await pool.query("SELECT * FROM alerts WHERE type = 'issues'"); // 7
        const notifCountRes = await pool.query("SELECT count(id) FROM alerts WHERE type = 'notifications'"); // 8
        const notifListRes = await pool.query("SELECT * FROM alerts WHERE type = 'notifications'"); // 9
        const tasksListRes = await pool.query("SELECT * FROM alerts WHERE type = 'tasks'"); // 10

        const totalCustomers = parseInt(customerCountRes.rows[0].count);
        const totalPages = Math.ceil(totalCustomers / limit);
        const totalRevenue = Number(revenueRes.rows[0].sum || 0).toLocaleString();

        res.render('index', {
            username: 'UTRGV Vaqueros',
            revenue: `$${totalRevenue}`,
            customerCount: totalCustomers.toLocaleString(),
            ordersCount: Number(ordersCountRes.rows[0].count).toLocaleString(),
            issuesCount: issuesCountRes.rows[0].count,
            notifCount: notifCountRes.rows[0].count,
            sales: salesRes.rows,
            customers: customersRes.rows,
            issues: issuesListRes.rows,
            notifications: notifListRes.rows,
            tasks: tasksListRes.rows,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Error loading dashboard data');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});