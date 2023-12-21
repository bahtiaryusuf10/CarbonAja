from flask import jsonify, request
from flask_restx import Namespace, Resource
from app.Controllers.controller import predict_image, load_model, track_location 
from app import api
import threading

careCarb = Namespace('careCarb', description='Operations related to careCarb')

def start_location_tracking(input_coordinates):
    thread = threading.Thread(target=track_location, args=(input_coordinates,))
    thread.start()

@careCarb.route('/food-predict')
class Predict(Resource):
    @careCarb.expect(api.parser().add_argument('file', type='file', location='files', required=True))
    def post(self):
        try:
            image_file = request.files['file']
            image_data = image_file.read()

            # Load the model
            model = load_model()  
            ingredient_list, total_carbon_produced = predict_image(model, image_data, threshold=0.5)

            sorted_results = sorted(ingredient_list, key=lambda x: x['Carbon produced'], reverse=True)

            return jsonify({"Predictions": sorted_results, "Total Carbon Produced": f"{total_carbon_produced:.3f} kgCO2e"})
        except Exception as e:
            return jsonify({'error': str(e)})
        
@careCarb.route('/transport-predict')
class TrackLocation(Resource):
    @careCarb.expect(api.parser().add_argument('coordinates', type=str, required=True, help='Coordinates in format: lat,lon'))
    def post(self):
        try:
            input_coordinates = request.args.get('coordinates')
            start_location_tracking(input_coordinates)
            return jsonify({"Message": "Location tracking started."})
        except Exception as e:
            return jsonify({'error': str(e)})