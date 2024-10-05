from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return jsonify(message='Hello, World!')

@app.route('/reverse', methods=['POST'])
def reverse_string():
    data = request.get_json()
    reversed_string = data['string'][::-1]
    return jsonify(reversed_string=reversed_string)

if __name__ == '__main__':
    app.run(debug=True)