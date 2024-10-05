from flask import Flask, jsonify, request
from flask_cors import CORS
from spacy_demo import load_models, mask_personal_info

app = Flask(__name__)
CORS(app)

# Load models once when the app starts
nlp_zh, nlp_en = load_models()


@app.route('/')
def hello_world():
    return jsonify(message='Hello, World!')


@app.route('/reverse', methods=['POST'])
def reverse_string():
    data = request.get_json()
    reversed_string = data['string'][::-1]
    return jsonify(result_text=reversed_string)


@app.route('/mask', methods=['POST'])
def mask_text():
    data = request.get_json()
    text = data['string']
    result_json = mask_personal_info(text, nlp_zh, nlp_en)
    raw_text = result_json['raw_text']
    masked_text = result_json['masked_text']
    masked_entities = result_json['masked_entities']
    return jsonify(raw_text=raw_text,
                   masked_text=masked_text,
                   masked_entities=masked_entities)


if __name__ == '__main__':
    app.run(debug=True)
