# ==========================================
# AI CROP PRICE PREDICTION
# ==========================================

import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib


# ==========================================
# SAMPLE HISTORICAL CROP PRICE DATA
# ==========================================

data = {
    "crop_code": [
        1, 1, 1, 1, 1,
        2, 2, 2, 2, 2,
        3, 3, 3, 3, 3,
        4, 4, 4, 4, 4
    ],

    "demand_kg": [
        500, 550, 600, 650, 700,
        400, 450, 500, 550, 600,
        300, 350, 400, 450, 500,
        600, 650, 700, 750, 800
    ],

    "quantity_kg": [
        1000, 950, 900, 850, 800,
        900, 850, 800, 750, 700,
        800, 750, 700, 650, 600,
        1200, 1150, 1100, 1050, 1000
    ],

    "price_per_kg": [
        20, 22, 24, 26, 28,
        30, 32, 34, 36, 38,
        40, 42, 44, 46, 48,
        18, 20, 22, 24, 26
    ]
}


# ==========================================
# CREATE DATAFRAME
# ==========================================

df = pd.DataFrame(data)


# ==========================================
# SELECT FEATURES AND TARGET
# ==========================================

X = df[
    [
        "crop_code",
        "demand_kg",
        "quantity_kg"
    ]
]

y = df["price_per_kg"]


# ==========================================
# SPLIT DATA
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# ==========================================
# CREATE RANDOM FOREST MODEL
# ==========================================

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)


# ==========================================
# TRAIN MODEL
# ==========================================

model.fit(
    X_train,
    y_train
)


# ==========================================
# TEST MODEL
# ==========================================

predictions = model.predict(
    X_test
)


# ==========================================
# CALCULATE MODEL ERROR
# ==========================================

mae = mean_absolute_error(
    y_test,
    predictions
)

print("Price prediction model trained successfully")

print(
    "Mean Absolute Error:",
    round(mae, 2)
)


# ==========================================
# PREDICT PRICE FOR NEW CROP DATA
# ==========================================

new_crop = pd.DataFrame({
    "crop_code": [1],
    "demand_kg": [750],
    "quantity_kg": [800]
})


predicted_price = model.predict(
    new_crop
)


# ==========================================
# DISPLAY PREDICTED PRICE
# ==========================================

print(
    "Predicted crop price:",
    round(float(predicted_price[0]), 2),
    "₹/kg"
)


# ==========================================
# SAVE TRAINED MODEL
# ==========================================

joblib.dump(
    model,
    "price_model.pkl"
)

print("Price prediction model saved successfully")