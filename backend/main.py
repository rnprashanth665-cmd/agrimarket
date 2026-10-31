from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import joblib
import os
from ai.route_optimization import calculate_distance

from database import engine, Base, get_db
from models import Product, User, Farmer, Buyer, Product , Order, Vehicle, Delivery, OrderReview
from schemas import (
    FarmerCreate,
    LoginRequest,
    OrderStatusUpdate,
    ProductCreate,
    BuyerCreate,
    OrderCreate,
    OrderStatusUpdate,
    DeliveryStatusUpdate,
    OrderReviewCreate
)

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)
# Load AI demand forecasting model
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "ai",
    "demand_model.pkl"
)

demand_model = joblib.load(MODEL_PATH)
# ==========================================
# LOAD AI CROP PRICE PREDICTION MODEL
# ==========================================

PRICE_MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "ai",
    "price_model.pkl"
)

# Load the trained crop price prediction model
price_model = joblib.load(PRICE_MODEL_PATH)


# ==========================================
# JWT SECURITY
# ==========================================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return payload


# ==========================================
# CREATE DATABASE TABLES
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# CREATE FASTAPI APPLICATION
# ==========================================

app = FastAPI(title="AgriMarket API")


# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# HOME ENDPOINT
# ==========================================

@app.get("/")
def home():
    return {
        "message": "AgriMarket API is running!"
    }


# ==========================================
# DATABASE TEST ENDPOINT
# ==========================================

@app.get("/database-test")
def database_test():

    try:

        with engine.connect() as connection:

            return {
                "status": "success",
                "message": "PostgreSQL connection is working!"
            }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }


# ==========================================
# FARMER REGISTRATION
# ==========================================

@app.post("/farmers/register")
def register_farmer(
    farmer_data: FarmerCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == farmer_data.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=farmer_data.name,
        email=farmer_data.email,
        phone=farmer_data.phone,
        password=hash_password(
            farmer_data.password
        ),
        role="farmer"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_farmer = Farmer(
        user_id=new_user.id,
        farm_location=farmer_data.farm_location,
        district=farmer_data.district,
        state=farmer_data.state,
        farm_size=farmer_data.farm_size
    )

    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)

    return {
        "message": "Farmer registered successfully",
        "user_id": new_user.id,
        "farmer_id": new_farmer.id
    }


# ==========================================
# FARMER LOGIN
# ==========================================

@app.post("/farmers/login")
def farmer_login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.password == login_data.password:
        user.password = hash_password(login_data.password)
        db.commit()

    if user.role != "farmer":

        raise HTTPException(
            status_code=403,
            detail="User is not registered as a farmer"
        )

    access_token = create_access_token({
        "user_id": user.id,
        "role": user.role,
        "email": user.email
    })

    return {
        "message": "Farmer login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }


# ==========================================
# FARMER PROFILE
# ==========================================

@app.get("/farmers/profile")
def farmer_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user.get("user_id")

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.role != "farmer":

        raise HTTPException(
            status_code=403,
            detail="User is not a farmer"
        )

    farmer = db.query(Farmer).filter(
        Farmer.user_id == user.id
    ).first()

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "farm_location": farmer.farm_location if farmer else None,
        "district": farmer.district if farmer else None,
        "state": farmer.state if farmer else None,
        "farm_size": farmer.farm_size if farmer else None
    }
# ==========================================
# ADD PRODUCT
# ==========================================

@app.post("/products")
def add_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user.get("user_id")

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.role != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can add products"
        )

    farmer = db.query(Farmer).filter(
        Farmer.user_id == user.id
    ).first()

    if not farmer:
        raise HTTPException(
            status_code=404,
            detail="Farmer profile not found"
        )

    new_product = Product(
        farmer_id=farmer.id,
        crop_name=product_data.crop_name,
        quantity=product_data.quantity,
        price_per_kg=product_data.price_per_kg,
        quality=product_data.quality,
        description=product_data.description
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product added successfully",
        "product_id": new_product.id,
        "farmer_id": farmer.id,
        "crop_name": new_product.crop_name,
        "quantity": new_product.quantity,
        "price_per_kg": new_product.price_per_kg
    }
# ==========================================
# VIEW ALL PRODUCTS
# ==========================================

@app.get("/products")
def get_products(
    db: Session = Depends(get_db)
):

    products = db.query(Product).all()

    return [
        {
            "product_id": product.id,
            "farmer_id": product.farmer_id,
            "crop_name": product.crop_name,
            "quantity": product.quantity,
            "price_per_kg": product.price_per_kg,
            "quality": product.quality,
            "description": product.description
        }
        for product in products
    ]
# ==========================================
# BUYER REGISTRATION
# ==========================================

@app.post("/buyers/register")
def register_buyer(
    buyer_data: BuyerCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == buyer_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=buyer_data.name,
        email=buyer_data.email,
        phone=buyer_data.phone,
        password=hash_password(
            buyer_data.password
        ),
        role="buyer"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_buyer = Buyer(
        user_id=new_user.id,
        business_name=buyer_data.business_name,
        buyer_type=buyer_data.buyer_type,
        location=buyer_data.location
    )

    db.add(new_buyer)
    db.commit()
    db.refresh(new_buyer)

    return {
        "message": "Buyer registered successfully",
        "user_id": new_user.id,
        "buyer_id": new_buyer.id
    }
# ==========================================
# BUYER LOGIN
# ==========================================

@app.post("/buyers/login")
def buyer_login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.password == login_data.password:
        user.password = hash_password(login_data.password)
        db.commit()

    if user.role != "buyer":
        raise HTTPException(
            status_code=403,
            detail="User is not registered as a buyer"
        )

    access_token = create_access_token({
        "user_id": user.id,
        "role": user.role,
        "email": user.email
    })

    return {
        "message": "Buyer login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }
# ==========================================
# BUYER PROFILE
# ==========================================

@app.get("/buyer/profile")
def buyer_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user.get("user_id")

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.role != "buyer":
        raise HTTPException(
            status_code=403,
            detail="User is not a buyer"
        )

    buyer = db.query(Buyer).filter(
        Buyer.user_id == user.id
    ).first()

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "business_name": buyer.business_name if buyer else None,
        "buyer_type": buyer.buyer_type if buyer else None,
        "location": buyer.location if buyer else None
    }
# ==========================================
# PLACE ORDER
# ==========================================

@app.post("/orders")
def place_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user.get("user_id")

    # Check buyer
    buyer = db.query(Buyer).filter(
        Buyer.user_id == user_id
    ).first()

    if not buyer:
        raise HTTPException(
            status_code=403,
            detail="Only buyers can place orders"
        )

    # Check product
    product = db.query(Product).filter(
        Product.id == order_data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Check quantity
    if order_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if order_data.quantity > product.quantity:
        raise HTTPException(
            status_code=400,
            detail="Requested quantity is not available"
        )

    # Calculate total price
    total_price = (
        order_data.quantity *
        product.price_per_kg
    )

    # Create order
    new_order = Order(
        buyer_id=buyer.id,
        product_id=product.id,
        quantity=order_data.quantity,
        total_price=total_price,
        status="Pending"
    )

    db.add(new_order)

    # Reduce available product quantity
    product.quantity -= order_data.quantity

    db.commit()
    db.refresh(new_order)

    return {
        "message": "Order placed successfully",
        "order_id": new_order.id,
        "buyer_id": buyer.id,
        "product_id": product.id,
        "crop_name": product.crop_name,
        "quantity": new_order.quantity,
        "price_per_kg": product.price_per_kg,
        "total_price": new_order.total_price,
        "status": new_order.status
    }
# ==========================================
# VIEW BUYER ORDERS
# ==========================================

@app.get("/orders/my-orders")
def get_my_orders(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user.get("user_id")

    buyer = db.query(Buyer).filter(
        Buyer.user_id == user_id
    ).first()

    if not buyer:
        raise HTTPException(
            status_code=403,
            detail="Only buyers can view orders"
        )

    orders = db.query(Order).filter(
        Order.buyer_id == buyer.id
    ).all()

    return [
        {
            "id": order.id,
            "order_id": order.id,
            "product_id": order.product_id,
            "crop_name": order.product.crop_name,
            "farmer_name": order.product.farmer.user.name,
            "quantity": order.quantity,
            "price_per_kg": order.product.price_per_kg,
            "total_price": order.total_price,
            "status": order.status,
            "order_date": order.order_date,
            "rating": order.review.rating if order.review else None,
            "feedback": order.review.feedback if order.review else None
        }
        for order in orders
    ]


@app.post("/orders/{order_id}/review")
def submit_order_review(
    order_id: int,
    review_data: OrderReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    buyer = db.query(Buyer).filter(
        Buyer.user_id == current_user.get("user_id")
    ).first()

    if not buyer:
        raise HTTPException(status_code=403, detail="Only buyers can review orders")

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.buyer_id == buyer.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status.lower() != "delivered":
        raise HTTPException(status_code=400, detail="You can review an order after it is delivered")

    if db.query(OrderReview).filter(OrderReview.order_id == order.id).first():
        raise HTTPException(status_code=409, detail="This order has already been reviewed")

    feedback = review_data.feedback.strip()
    if not feedback:
        raise HTTPException(status_code=400, detail="Feedback cannot be blank")

    review = OrderReview(
        order_id=order.id,
        buyer_id=buyer.id,
        rating=review_data.rating,
        feedback=feedback
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return {
        "message": "Review submitted successfully",
        "order_id": order.id,
        "rating": review.rating,
        "feedback": review.feedback
    }


# ==========================================
# VIEW FARMER ORDERS
# ==========================================

@app.get("/farmer/orders")
def get_farmer_orders(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user.get("user_id")

    # Find farmer
    farmer = db.query(Farmer).filter(
        Farmer.user_id == user_id
    ).first()

    if not farmer:
        raise HTTPException(
            status_code=403,
            detail="Only farmers can view orders"
        )

    # Get orders for farmer's products
    orders = (
        db.query(Order)
        .join(Product, Order.product_id == Product.id)
        .join(Buyer, Order.buyer_id == Buyer.id)
        .join(User, Buyer.user_id == User.id)
        .filter(Product.farmer_id == farmer.id)
        .all()
    )

    return [
        {
            # Order details
            "id": order.id,
            "order_id": order.id,
            "product_id": order.product_id,
            "crop_name": order.product.crop_name,
            "quantity": order.quantity,
            "price_per_kg": order.product.price_per_kg,
            "total_price": order.total_price,
            "status": order.status,
            "order_date": order.order_date,

            # Buyer details
            "buyer_id": order.buyer_id,
            "buyer_name": order.buyer.user.name,
            "buyer_email": order.buyer.user.email,
            "buyer_phone": order.buyer.user.phone,
            "business_name": order.buyer.business_name,
            "buyer_type": order.buyer.buyer_type,

            # Delivery location
            "delivery_location": order.buyer.location
        }
        for order in orders
    ]
# ==========================================
# UPDATE ORDER STATUS
# ==========================================

@app.put("/farmer/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user.get("user_id")

    farmer = db.query(Farmer).filter(
        Farmer.user_id == user_id
    ).first()

    if not farmer:
        raise HTTPException(
            status_code=403,
            detail="Only farmers can update orders"
        )

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    product = db.query(Product).filter(
        Product.id == order.product_id
    ).first()

    if not product or product.farmer_id != farmer.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update orders for your products"
        )

    if status_data.status not in ["Accepted", "Rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be Accepted or Rejected"
        )

    order.status = status_data.status

    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status
    }
#vehicle management
@app.post("/vehicles")
def add_vehicle(
    vehicle_number: str,
    vehicle_type: str,
    capacity_kg: float,
    driver_name: str,
    driver_phone: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.get("role") != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can add vehicles"
        )

    existing_vehicle = db.query(Vehicle).filter(
        Vehicle.vehicle_number == vehicle_number
    ).first()

    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="Vehicle already exists"
        )

    new_vehicle = Vehicle(
        vehicle_number=vehicle_number,
        vehicle_type=vehicle_type,
        capacity_kg=capacity_kg,
        driver_name=driver_name,
        driver_phone=driver_phone
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return {
        "message": "Vehicle added successfully",
        "vehicle_id": new_vehicle.id,
        "vehicle_number": new_vehicle.vehicle_number,
        "vehicle_type": new_vehicle.vehicle_type,
        "capacity_kg": new_vehicle.capacity_kg,
        "driver_name": new_vehicle.driver_name,
        "driver_phone": new_vehicle.driver_phone
    }
# Get all vehicles
@app.get("/vehicles")
def get_vehicles(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can view vehicles"
        )

    vehicles = db.query(Vehicle).all()

    return [
        {
            "vehicle_id": vehicle.id,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "capacity_kg": vehicle.capacity_kg,
            "driver_name": vehicle.driver_name,
            "driver_phone": vehicle.driver_phone
        }
        for vehicle in vehicles
    ]
# DELIVERY 
@app.post("/deliveries")
def create_delivery(
    order_id: int,
    vehicle_id: int,
    pickup_location: str,
    delivery_location: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.get("role") != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can create deliveries"
        )

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order.status != "Accepted":
        raise HTTPException(
            status_code=400,
            detail="Order must be Accepted before delivery"
        )

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    delivery = Delivery(
        order_id=order_id,
        vehicle_id=vehicle_id,
        pickup_location=pickup_location,
        delivery_location=delivery_location,
        status="Assigned"
    )

    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    return {
        "message": "Delivery assigned successfully",
        "delivery_id": delivery.id,
        "order_id": order_id,
        "vehicle_id": vehicle_id,
        "vehicle_number": vehicle.vehicle_number,
        "pickup_location": pickup_location,
        "delivery_location": delivery_location,
        "status": delivery.status
    }
 #Delivery details
@app.get("/deliveries")
def get_deliveries(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.get("role") != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can view deliveries"
        )

    deliveries = db.query(Delivery).all()

    return [
        {
            "delivery_id": delivery.id,
            "order_id": delivery.order_id,
            "vehicle_id": delivery.vehicle_id,
            "pickup_location": delivery.pickup_location,
            "delivery_location": delivery.delivery_location,
            "status": delivery.status
        }
        for delivery in deliveries
    ]
#delivery status update
@app.put("/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: int,
    status_data: DeliveryStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.get("role") != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can update delivery status"
        )

    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=404,
            detail="Delivery not found"
        )

    allowed_statuses = [
        "Assigned",
        "Picked Up",
        "In Transit",
        "Delivered"
    ]

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid delivery status"
        )

    delivery.status = status_data.status

    # If delivery is completed, update the order too
    if status_data.status == "Delivered":
        order = db.query(Order).filter(
            Order.id == delivery.order_id
        ).first()

        if order:
            order.status = "Delivered"

    db.commit()
    db.refresh(delivery)

    return {
        "message": "Delivery status updated successfully",
        "delivery_id": delivery.id,
        "order_id": delivery.order_id,
        "status": delivery.status
    }
# ==========================================
# AI DEMAND FORECASTING
# ==========================================

@app.get("/ai/demand-forecast")
def demand_forecast():

    # Predict demand for the next day
    next_day = [[16]]

    predicted_demand = demand_model.predict(
        next_day
    )

    # Return the predicted demand in kilograms
    return {
        "predicted_demand_kg": round(
            float(predicted_demand[0]),
            2
        )
    }
# ==========================================
# AI CROP PRICE PREDICTION
# ==========================================

@app.get("/ai/price-prediction")
def price_prediction():

    # Sample input for prediction
    # crop_code 1 = Tomato
    # demand = 750 kg
    # available quantity = 800 kg
    new_crop = [[
        1,
        750,
        800
    ]]

    # Predict crop price
    predicted_price = price_model.predict(
        new_crop
    )

    # Return predicted price
    return {
        "crop": "Tomato",
        "predicted_price_per_kg": round(
            float(predicted_price[0]),
            2
        )
    }
# ==========================================
# AI SMART ROUTE OPTIMIZATION API
# ==========================================

@app.get("/ai/route-optimization")
def route_optimization():

    # Farmer pickup location
    farmer_latitude = 16.029
    farmer_longitude = 78.438

    # Buyer delivery location
    buyer_latitude = 16.506
    buyer_longitude = 80.648

    # Calculate approximate route distance
    distance = calculate_distance(
        farmer_latitude,
        farmer_longitude,
        buyer_latitude,
        buyer_longitude
    )

    # Return route information
    return {
        "pickup": "Ramapuram, Gadwal, Telangana",
        "destination": "Vijayawada, Andhra Pradesh",
        "distance_km": round(
            distance,
            2
        )
    }
# ==========================================
# AI DASHBOARD
# ==========================================

@app.get("/ai/dashboard")
def ai_dashboard():

    # ==========================================
    # DEMAND FORECAST
    # ==========================================

    next_day = [[16]]

    predicted_demand = demand_model.predict(
        next_day
    )

    # ==========================================
    # CROP PRICE PREDICTION
    # ==========================================

    new_crop = [[
        1,      # Tomato crop code
        750,    # Expected demand
        800     # Available quantity
    ]]

    predicted_price = price_model.predict(
        new_crop
    )

    # ==========================================
    # ROUTE OPTIMIZATION
    # ==========================================

    farmer_latitude = 16.029
    farmer_longitude = 78.438

    buyer_latitude = 16.506
    buyer_longitude = 80.648

    distance = calculate_distance(
        farmer_latitude,
        farmer_longitude,
        buyer_latitude,
        buyer_longitude
    )

    # ==========================================
    # RETURN ALL AI RESULTS
    # ==========================================

    return {
        "demand_forecast_kg": round(
            float(predicted_demand[0]),
            2
        ),

        "predicted_price_per_kg": round(
            float(predicted_price[0]),
            2
        ),

        "route_distance_km": round(
            distance,
            2
        )
    }