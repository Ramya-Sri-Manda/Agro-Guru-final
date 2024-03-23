from flask import Flask, render_template, request
from sklearn.preprocessing import StandardScaler  
import joblib
import numpy as np


model = joblib.load(open('classifier.pkl',"rb"))

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if request.method == "POST":
        try:
            
            nitrogen = float(request.form.get("nitrogen"))
            phosphorus = float(request.form.get("phosphorus"))
            potassium = float(request.form.get("potassium"))
            temperature = float(request.form.get("temperature"))
            humidity = float(request.form.get("humidity"))
            ph = float(request.form.get("ph"))
            rainfall = float(request.form.get("rainfall"))

            
            arr = np.array([[nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]])
            pred = model.predict(arr)
           

            p = pred.astype(int)
            return render_template("result.html", prediction=pred[0])
        except (ValueError, TypeError):  
            return "Invalid input. Please enter numerical values for all fields."
    else:
        return "Invalid method"

if __name__ == "__main__":
    app.run(debug=True, port=5001)