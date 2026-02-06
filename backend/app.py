from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os  

app = Flask(__name__)
CORS(app) 


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


model_path = os.path.join(BASE_DIR, 'password_model.pkl')
vectorizer_path = os.path.join(BASE_DIR, 'vectorizer.pkl')


try:
    print("Loading model from:", model_path)
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    password = data.get('password', '')
    
    if not password:
        return jsonify({'error': 'No password provided'}), 400

    features = vectorizer.transform([password])
    prediction = model.predict(features)[0]
    
   
    if prediction != 2:
        if len(password) > 13:
            has_digit = any(char.isdigit() for char in password)
            has_upper = any(char.isupper() for char in password)
            has_special = any(not char.isalnum() for char in password)
            
            if has_digit and has_upper and has_special:
                print("Hybrid Logic: Overriding prediction to STRONG.")
                prediction = 2
    
    labels = {0: "Weak", 1: "Medium", 2: "Strong"}
    result_label = labels.get(prediction, "Unknown")

    return jsonify({
        'strength': int(prediction),
        'label': result_label
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)