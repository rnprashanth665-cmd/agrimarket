# ==========================================
# AI SMART ROUTE OPTIMIZATION
# ==========================================

import math


# ==========================================
# HAVERSINE DISTANCE FUNCTION
# ==========================================

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):
    """
    Calculate the approximate distance
    between two locations in kilometers.
    """

    # Radius of Earth in kilometers
    earth_radius = 6371

    # Convert degrees to radians
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)

    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    # Difference between coordinates
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    distance = earth_radius * c

    return distance


# ==========================================
# SAMPLE FARMER LOCATION
# ==========================================

farmer_latitude = 16.029
farmer_longitude = 78.438


# ==========================================
# SAMPLE BUYER LOCATION
# ==========================================

buyer_latitude = 16.506
buyer_longitude = 80.648


# ==========================================
# CALCULATE ROUTE DISTANCE
# ==========================================

distance = calculate_distance(
    farmer_latitude,
    farmer_longitude,
    buyer_latitude,
    buyer_longitude
)


# ==========================================
# DISPLAY RESULT
# ==========================================

print("Smart route optimization completed")

print(
    "Estimated route distance:",
    round(distance, 2),
    "km"
)