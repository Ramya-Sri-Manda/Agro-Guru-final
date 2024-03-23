from flask import Flask,render_template,request
from sklearn.preprocessing import StandardScaler
import joblib
import pickle
import numpy as np
# Load your ML model (replace with your actual loading logic)
model = pickle.load(open("classifi.pkl","rb"))
print(model)

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index1.html")

@app.route("/predict1", methods=["POST"])
def predict():
    if request.method == "POST":
        try:
            # Extract user input from the form
            nitrogen = float(request.form.get("nitrogen"))
            phosphorus = float(request.form.get("phosphorus"))
            potassium = float(request.form.get("potassium"))
            Ph  = float(request.form.get("Phlevel"))
            Electrical = float(request.form.get("ElectricalConductivity"))
            carbon = float(request.form.get("OrganicCarbon"))
            Sulfur = float(request.form.get("sulphur"))
            Zinc = float(request.form.get("Zinc"))
            iron = float(request.form.get("iron"))
            cu = float(request.form.get("copper"))
            mg= float(request.form.get("manganeese"))
            b = float(request.form.get("boron"))
            
            arr = np.array([[nitrogen,phosphorus,potassium,Ph,Electrical,carbon,Sulfur,Zinc,iron,cu,mg,b]])
            pred = model.predict(arr)
            
            p = pred.astype(int)
            # Return the prediction to the template
            print(p)
            return render_template("result1.html", predict=p[0])
        except (ValueError, TypeError):  # Handle potential errors
            return "Invalid input. Please enter numerical values for all fields."
    else:
        return "Invalid method"

if __name__ == "__main__":
    app.run(debug=True, port=5000)
