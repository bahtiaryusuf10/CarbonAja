import numpy as np
import pandas as pd
import os
from PIL import Image, ImageOps
from io import BytesIO
import tensorflow as tf
import time
from math import radians, sin, cos, sqrt, atan2
from sklearn.preprocessing import LabelEncoder

def api_hit_response():
    return {"Message": "API Accessed!"}

# Function to load the model
def load_model(model_path=None):
    try:
        # Load the model
        if model_path:
            loaded_model = tf.saved_model.load(model_path)
        else:
            loaded_model = tf.saved_model.load(os.path.join(os.getcwd(), 'app', 'Models', 'MobileNetV3-L'))

        return loaded_model
    except Exception as e:
        print(f"Error loading the model: {e}")
        return None
    
class_labels = ['Cheese', 'Unlabeled', 'Beef', 'Chocolate', 'Coffee', 'Eggs', 'Fish', 'Lamb', 'Pork', 'Poultry', 'Prawns', 'Rice']

labels = {
    0: {"Ingredients": "Cheese 250g", "Carbon produced": 5.25},
    1: {"Ingredients": "Unlabeled 250g", "Carbon produced": 0},
    2: {"Ingredients": "Beef 250g", "Carbon produced": 15},
    3: {"Ingredients": "Chocolate 250g", "Carbon produced": 4.75},
    4: {"Ingredients": "Coffee 250g", "Carbon produced": 4.25},
    5: {"Ingredients": "Eggs 250g", "Carbon produced": 1.125},
    6: {"Ingredients": "Fish 250g", "Carbon produced": 1.25},
    7: {"Ingredients": "Lamb 250g", "Carbon produced": 6},
    8: {"Ingredients": "Pork 250g", "Carbon produced": 1.75},
    9: {"Ingredients": "Poultry 250g", "Carbon produced": 1.5},
    10: {"Ingredients": "Prawns 250g", "Carbon produced": 3},
    11: {"Ingredients": "Rice 250g", "Carbon produced": 1},
}    
    
def predict_image(model, image_data, threshold=0.5):
    img = Image.open(BytesIO(image_data))
    img = img.resize((224, 224))
    img_array = np.array(img)
    img_array = img_array.astype(np.float32) 
    img_array = img_array / 255.0  

    img_array = np.expand_dims(img_array, axis=0)
    
    image_tensor = tf.constant(img_array) 

    prediction = model(image_tensor)
    pred_class = class_labels
    pred_df = pd.DataFrame({'class': pred_class, 'probability': prediction[0]})
    pred_df = pred_df.sort_values(by=['probability'], ascending=False)

    selected_classes = pred_df[pred_df['probability'] > threshold]

    ingredients_list = []
    total_carbon_produced = 0

    for _, row in selected_classes.iterrows():
        class_label = row['class']
        probability = row['probability']
        carbon_produced = labels[class_labels.index(class_label)]['Carbon produced'] * probability
        total_carbon_produced += carbon_produced

        ingredients_list.append({
            'Ingredients': labels[class_labels.index(class_label)]['Ingredients'],
            'Carbon produced': f"{carbon_produced:.3f} kgCO2e"
        })

    return ingredients_list, total_carbon_produced

# Function to calculate haversine distance
def haversine_distance(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    radius = 6371000.0  # Radius of the Earth in meters
    distance = radius * c
    return distance

def track_location(input_coordinates):
    # Initialize start_time outside the loop
    start_time = time.time()

    # Initialize an empty list to store the results
    results_list = []

    # Initialize total_distance and total_time_count outside the loop
    total_distance = 0
    total_time_count = 0

    # Initialize coordinates_list
    coordinates_list = []

    # Initialize variables to track consecutive predictions and travel times
    previous_prediction = None
    consecutive_predictions = 0
    previous_travel_time = 0
    traffic_detected = False

    # Load model
    model = load_model(os.path.join(os.getcwd(), 'app', 'Models', 'Transport', 'ImprovedTransportModel.h5'))
    scaler = np.load(os.path.join(os.getcwd(), 'app', 'Models', 'Transport', 'scaler.npy'), allow_pickle=True).item()
    label_encoder = LabelEncoder()
    label_encoder.classes_ = np.load(os.path.join(os.getcwd(), 'app', 'Models', 'Transport', 'label_encoder_classes.npy'), allow_pickle=True)

    # Continuous loop
    while True:
        total_time_count = 0

        iteration_end_time = time.time()

        iteration_time = iteration_end_time - start_time

        total_time_count += iteration_time

        lat, lon = map(float, input_coordinates.split(','))

        coordinates_list.append({'Latitude': lat, 'Longitude': lon})

        if len(coordinates_list) > 1:
            current_coordinates = coordinates_list[-1]
            previous_coordinates = coordinates_list[-2]
            distance = haversine_distance(
                current_coordinates['Latitude'], current_coordinates['Longitude'],
                previous_coordinates['Latitude'], previous_coordinates['Longitude']
            )
            total_distance += distance

            total_time_count_minutes = total_time_count / 60.0

            print(f'Distance: {total_distance:.2f} meters for {total_time_count_minutes:.2f} minutes')

            if total_distance >= 800:
                new_data = {'Distance': [total_distance], 'TravelTime': [total_time_count_minutes]}
                new_df = pd.DataFrame(new_data)

                # Standardize features
                new_data_scaled = scaler.transform(new_df)

                # Predict
                predictions = model.predict(new_data_scaled)
                predicted_class_index = predictions.argmax(axis=1)[0]
                predicted_transportation = label_encoder.classes_[predicted_class_index]

                # Check if the prediction is consistent for the last 5 iterations
                if consecutive_predictions < 3 or predicted_transportation == previous_prediction:
                    consecutive_predictions += 1
                else:
                    consecutive_predictions = 1  # Reset if the prediction changes
                    traffic_detected = False

                # Check if there is a significant change in travel time
                if consecutive_predictions == 3 and not traffic_detected:
                    travel_time_change = total_time_count_minutes - previous_travel_time
                    if travel_time_change > 1:  # Adjust this threshold as needed
                        traffic_detected = True
                        print(f'Traffic detected! Travel time increased by {travel_time_change:.2f} minutes.')

                # Store the results in the list
                results_list.append({
                    'Origin': previous_coordinates,
                    'Destination': current_coordinates,
                    'Distance': total_distance,
                    'TravelTime': total_time_count_minutes,
                    'PredictedTransportation': predicted_transportation
                })

                print(f'Predicted Transportation: {predicted_transportation}')

                # Reset total_distance and total_time_count after each prediction
                total_distance = 0
                total_time_count = 0

                # Convert the results list to a DataFrame
                results_df = pd.DataFrame(results_list)

                # Save the results to a CSV file
                results_df.to_csv('predicted_results.csv', index=False)
                # Update the start_time for the next iteration
                start_time = time.time()
                # Update the previous prediction for the next iteration
                previous_prediction = predicted_transportation
                previous_travel_time = total_time_count_minutes