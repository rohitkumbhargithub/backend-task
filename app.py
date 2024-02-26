from flask import Flask, render_template, request
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


#implement bar chart
@app.route('/bar-chart')
def bar_chart():
    # Fetch data from the API
    api_url = 'http://localhost:5000/bar-chart?month=1'
    response = requests.get(api_url)
    print(response.url)
    data = response.json()
    
    # Process data for bar chart
    product_price = [i['range'] for i in data['ranges']]
    product_count = [i['count'] for i in data['ranges']]

    return render_template('bar_chart.html', categories=product_price, item_counts=product_count)


#implement serach bar chart
@app.route('/search_bar', methods=['GET', 'POST'])
def search_bar_chart():
    # Fetch data from the API
    if request.method == 'POST':
        # Get user input from the form
        user_input = request.form['user_input']

    params = {'month': user_input}
    api_url = 'http://localhost:5000/bar-chart'
    response = requests.get(api_url, params=params)
    print(response.url)
    data = response.json()

    
    # Process data for bar chart
    product_price = [i['range'] for i in data['ranges']]
    product_count = [i['count'] for i in data['ranges']]

    return render_template('bar_chart.html', categories=product_price, item_counts=product_count)


#implement pie chart
@app.route('/pie-chart')
def pie_chart():
    # Fetch data from the API
    api_url = 'http://localhost:5000/category?month=1'

    response = requests.get(api_url)
    print(response.url)
    data = response.json()

    return render_template('pie_chart.html', data=data)


#implement pie chart
@app.route('/search', methods = ['GET', 'POST'])
def search_pie_chart():
    # Fetch data from the API
    if request.method == 'POST':
        # Get user input from the form
        user_input = request.form['user_input']

    params = {'month': user_input}
    api_url = 'http://localhost:5000/category'

    response = requests.get(api_url, params=params)
    print(response.url)
    data = response.json()

    return render_template('pie_chart.html', data=data)


@app.route('/stastatics')
def static_chart():
    # Fetch data from the API
    api_url = 'http://localhost:5000/statistics?month=1'

    response = requests.get(api_url)
    print(response.url)
    data = response.json()

    return render_template('stastatics.html', data=data)



@app.route('/search_static', methods = ['GET', 'POST'])
def search_static_chart():
    # Fetch data from the API
    if request.method == 'POST':
        # Get user input from the form
        user_input = request.form['user_input']

    params = {'month': user_input}
    api_url = 'http://localhost:5000/statistics'

    response = requests.get(api_url, params=params)
    print(response.url)
    data = response.json()

    return render_template('stastatics.html', data=data)


if __name__ == '__main__':
    app.run(debug=True)

