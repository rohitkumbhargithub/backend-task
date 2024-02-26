
# Backend Test

Created API using Node.js and Reational database(MySQL phpmyadmin) and Python for statistics pages

#### Folder structure
 
```http
 backend task
 |
 branch API -> index.js
 |
 branch statistics 
               | -> templates
               |             | -> index.html
               |             | -> statistics.html
               |             | -> pie_chart.html
               |             | -> bar-chart.html
               | -> app.py
```



## API Reference

#### Get for API page using node.js

Initialize json data to the database

```http
 http://localhost:5000/send-data
```

Product sold month (spcify month in number (1-12))

```http
 http://localhost:5000/product-sold
```

Search and pagination on product transactions

```http
 http://localhost:5000/transactions
```

Statistics Api totalSaleAmount, totalSoldItems and totalUnsoldItems

```http
 http://localhost:5000/statistics
```

Bar chart for products contain price range and the number of items in that range for the selected month
```http
 http://localhost:5000/bar-chart
```

pie chart for category, Find unique categories and number of items
```http
 http://localhost:5000/category
```


#### Get for statistics page using python

get the home page

```http
  http://127.0.0.1:5000/
```

get the statistics total numbers product, sold and unSold product

```http
  http://127.0.0.1:5000/statistics
```

get the Price range and the number of items

```http
  http://127.0.0.1:5000/bar-chart
```

get the categories and number of items

```http
  http://127.0.0.1:5000/pie-chart
```

