from flask import Flask, request, jsonify
from flask_restx import Api, Namespace, Resource, fields
import numpy as np
from PIL import Image, ImageOps
from io import BytesIO
import tensorflow as tf

app = Flask(__name__)
api = Api(app, version='1.0', title='My API', description='An example API')

careCarb = Namespace('careCarb', description='Operations related to careCarb')

def api_hit_response():
    return {"Message": "API Accessed!"}

def load_model():
    try:
        model_path = 'E:\capstone-project-ml\MobileNetV3-L'
        loaded_model = tf.saved_model.load(model_path)
        print("Model loaded successfully.")
        return loaded_model
    except Exception as e:
        print(f"Error loading the model: {e}")
        return None
    
def predict_image(image_data, model, threshold=0.5):
    data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
    image = Image.open(BytesIO(image_data))
    size = (224, 224)
    image = ImageOps.fit(image, size, Image.LANCZOS)
    image_array = np.asarray(image)
    normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1
    data[0] = normalized_image_array

    # Make prediction
    prediction = model.signatures["serving_default"](tf.constant(data))
    print("Raw Prediction Values:", prediction['output'])

    # Retrieve information for the predicted classes
    labels = {
        0: {"Ingredients": "Cheese 250g", "Carbon produced": 5.25},
        1: {"Ingredients": "Unlabeled 250g", "Carbon produced": 0},
        2: {"Ingredients": "beef 250g", "Carbon produced": 15},
        3: {"Ingredients": "chocolate 250g", "Carbon produced": 4.75},
        4: {"Ingredients": "coffee 250g", "Carbon produced": 4.25},
        5: {"Ingredients": "eggs 250g", "Carbon produced": 1.125},
        6: {"Ingredients": "fish 250g", "Carbon produced": 1.25},
        7: {"Ingredients": "lamb 250g", "Carbon produced": 6},
        8: {"Ingredients": "pork 250g", "Carbon produced": 1.75},
        9: {"Ingredients": "poultry 250g", "Carbon produced": 1.5},
        10: {"Ingredients": "prawns 250g", "Carbon produced": 3},
        11: {"Ingredients": "rice 250g", "Carbon produced": 1},
    }
    
    # Apply threshold to the prediction probabilities for each class
    predictions = {idx: prob for idx, prob in enumerate(prediction["output"][0])}
    predicted_classes = [idx for idx, prob in predictions.items() if prob > threshold]

    # If no class passes the threshold, select all classes with probability > 0.1
    if not predicted_classes:
        predicted_classes = [idx for idx, prob in predictions.items() if prob > 0.1]

    results = [{
        "Predicted Class": int(class_idx),
        "Ingredients": str(labels[class_idx]["Ingredients"]),  
        "Carbon Produced": float(labels[class_idx]["Carbon produced"]),
        "Probability": float(predictions[class_idx]) 
    } for class_idx in predicted_classes]

    return results

# Load the model
model = load_model()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Fungsi untuk memeriksa ekstensi file yang diizinkan
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@careCarb.route('/food-predict')
class Predict(Resource):
    @careCarb.expect(api.parser().add_argument('file', type='file', location='files', required=True))
    def post(self):
        try:
            # Get the image file sent via form-data with the name 'file'
            image_file = request.files['file']
            image_data = image_file.read()

            # Perform prediction using the model
            results = predict_image(image_data, model, threshold=0.5)  # Adjust with desired threshold

            # Sort the results based on the probabilities in descending order
            sorted_results = sorted(results, key=lambda x: x['Carbon Produced'], reverse=True)

            return jsonify(sorted_results)
        except Exception as e:
            return jsonify({'error': str(e)})

# Add the namespace to the API
api.add_namespace(careCarb)

if __name__ == '__main__':
    app.run(debug=True)
