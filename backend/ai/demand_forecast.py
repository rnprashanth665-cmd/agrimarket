import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib


# Sample historical demand data
data = {
    "day": [
        1, 2, 3, 4, 5,
        6, 7, 8, 9, 10,
        11, 12, 13, 14, 15
    ],
    "demand": [
        100, 120, 115, 140, 150,
        160, 155, 170, 180, 190,
        200, 210, 205, 220, 230
    ]
}

df = pd.DataFrame(data)

X = df[["day"]]
y = df["demand"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)

mae = mean_absolute_error(
    y_test,
    predictions
)

print("Model trained successfully")
print("Mean Absolute Error:", mae)

# Predict demand for next day
next_day = pd.DataFrame({"day": [16]})

predicted_demand = model.predict(next_day)

print(
    "Predicted demand for next day:",
    round(predicted_demand[0], 2),
    "kg"
)

# Save model
joblib.dump(
    model,
    "demand_model.pkl"
)

print("Model saved successfully")