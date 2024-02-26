const { default: axios } = require('axios');
const express = require('express');
const mysql = require('mysql');

const app = express();
const PORT = 5000;


// implement MySql phpmyadmin database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "",
    database: "test"
});

connection.connect(err => {
    if(err){
        console.error("Error in connecting MYSQL ", err);
        return;
    }
    console.log("Database connected!");
})


// initialize json data to the database

app.post('/send-data', async (req, res) => {
    try{

        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        const insertQuery = 'INSERT INTO `products` (`title`, `price`, `description`, `category`, `image`, `sold`, `dateOfSale`) VALUES ? ';
        const values = products.map(product => [product.title, product.price, product.description, product.category, product.image, product.sold, product.dateOfSale]);

        connection.query(insertQuery, [values], (err, result) => {
            if (err) throw err;
            console.log('Data inserted into database');
        });

    }catch(err){
        console.log("error ", err);
    }
});


// product sold month 
app.get('/product-sold', (req, res) => {
    const { month } = req.query;

    // Query the database to fetch products sold in the specified month
    const query = `SELECT * FROM products WHERE MONTH(dateOfSale) = ${req.query.month}`;
    connection.query(query, [month], (err, result) => {
        if (err) {
          console.error('Error fetching products:', err);
          res.status(500).json({ error: 'Failed to fetch products from the database' });
        } else {
          res.json(result);
        }
      });
  });


// Search and pagination on product transactions
app.get('/transactions', (req, res) => {
    const { page = 1, perPage = 10, search = '' } = req.query;
    const offset = (page - 1) * perPage;
  
    let whereClause = '';
    let searchParams = [];
    if (search) {
      whereClause = 'WHERE title LIKE ? OR description LIKE ? OR price LIKE ?';
      searchParams = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
  
    const countQuery = `SELECT COUNT(*) AS total FROM products ${whereClause}`;
    connection.query(countQuery, searchParams, (err, resultCount) => {
      if (err) {
        console.error('Error counting records:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const totalCount = resultCount[0].total;
  
      const selectQuery = `SELECT * FROM products ${whereClause} LIMIT ?, ?`;
      connection.query(selectQuery, [...searchParams, offset, perPage], (err, results) => {
        if (err) {
          console.error('Error fetching transactions:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        res.json({
          page: parseInt(page),
          perPage: parseInt(perPage),
          totalCount,
          data: results
        });
      });
    });
  });


// Statistics Api
  app.get('/statistics', (req, res) => {
    const { month } = req.query;

    // SQL query to calculate statistics for the selected month
    const query = `
      SELECT 
        SUM(CASE WHEN sold = 1 THEN price ELSE 0 END) AS totalSaleAmount,
        SUM(CASE WHEN sold = 1 THEN 1 ELSE 0 END) AS totalSoldItems,
        SUM(CASE WHEN sold = 0 THEN 1 ELSE 0 END) AS totalUnsoldItems
      FROM products
      WHERE MONTH(dateOfSale) = ${req.query.month};
    `;

    connection.query(query, [month], (err, result) => {
      if (err) {
        console.error('Error fetching statistics data:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      // Extract the data from the result
      const { totalSaleAmount, totalSoldItems, totalUnsoldItems } = result[0];
  
      // Prepare response
      const response = {
        totalSaleAmount,
        totalSoldItems,
        totalUnsoldItems
      };
  
      res.json(response);
    });
  });


// bar chart for productd
  app.get('/bar-chart', (req, res) => {
  const {month} = req.query;

  // SQL query to get the price range and count of items in each range for the selected month
  const query = `
    SELECT 
      SUM(CASE WHEN price BETWEEN 0 AND 100 THEN 1 ELSE 0 END) AS range_0_100,
      SUM(CASE WHEN price BETWEEN 101 AND 200 THEN 1 ELSE 0 END) AS range_101_200,
      SUM(CASE WHEN price BETWEEN 201 AND 300 THEN 1 ELSE 0 END) AS range_201_300,
      SUM(CASE WHEN price BETWEEN 301 AND 400 THEN 1 ELSE 0 END) AS range_301_400,
      SUM(CASE WHEN price BETWEEN 401 AND 500 THEN 1 ELSE 0 END) AS range_401_500,
      SUM(CASE WHEN price BETWEEN 501 AND 600 THEN 1 ELSE 0 END) AS range_501_600,
      SUM(CASE WHEN price BETWEEN 601 AND 700 THEN 1 ELSE 0 END) AS range_601_700,
      SUM(CASE WHEN price BETWEEN 701 AND 800 THEN 1 ELSE 0 END) AS range_701_800,
      SUM(CASE WHEN price BETWEEN 801 AND 900 THEN 1 ELSE 0 END) AS range_801_900,
      SUM(CASE WHEN price >= 901 THEN 1 ELSE 0 END) AS range_901_above
    FROM products
    WHERE MONTH(dateOfSale) = ${req.query.month};
  `;

  connection.query(query, [month], (err, result) => {
    if (err) {
      console.error('Error fetching bar chart data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Extract the data from the result
    const data = result[0];

    // Prepare response
    const response = {
      month: month,
      ranges: [
        { range: '0 - 100', count: data.range_0_100 },
        { range: '101 - 200', count: data.range_101_200 },
        { range: '201 - 300', count: data.range_201_300 },
        { range: '301 - 400', count: data.range_301_400 },
        { range: '401 - 500', count: data.range_401_500 },
        { range: '501 - 600', count: data.range_501_600 },
        { range: '601 - 700', count: data.range_601_700 },
        { range: '701 - 800', count: data.range_701_800 },
        { range: '801 - 900', count: data.range_801_900 },
        { range: '901 - above', count: data.range_901_above }
      ]
    };

    res.json(response);
  });
});


// pie chart for category
app.get('/category', (req, res) => {
  
  const {month} = req.query;

  // SQL query to get the price range and count of items in each range for the selected month
  const query = `
    SELECT category, COUNT(*) AS item_count FROM products WHERE MONTH(dateOfSale) = ${req.query.month} GROUP BY category;
  `;

  connection.query(query, [month], (err, results) => {
    if (err) {
      console.error('Error fetching bar chart data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Prepare response
    const data = {};
    results.forEach(({ category, item_count }) => {
      data[category] = item_count;
    });

    res.json(data);
  });
});


app.listen(PORT, () =>{
    console.log("server is connected ", PORT);
})