from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Text,
    CheckConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)

    farmer = relationship("Farmer", back_populates="user", uselist=False)
    buyer = relationship("Buyer", back_populates="user", uselist=False)


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    farm_location = Column(String(255))
    district = Column(String(100))
    state = Column(String(100))
    farm_size = Column(Float)

    user = relationship("User", back_populates="farmer")
    products = relationship("Product", back_populates="farmer")


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    business_name = Column(String(150))
    buyer_type = Column(String(50))
    location = Column(String(255))

    user = relationship("User", back_populates="buyer")
    orders = relationship("Order", back_populates="buyer")


class FPO(Base):
    __tablename__ = "fpos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(255))
    registration_number = Column(String(100), unique=True)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)

    crop_name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    harvest_date = Column(DateTime)
    quality = Column(String(50))
    description = Column(Text)

    farmer = relationship("Farmer", back_populates="products")
    orders = relationship("Order", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    quantity = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="Pending")

    buyer = relationship("Buyer", back_populates="orders")
    product = relationship("Product", back_populates="orders")

    delivery = relationship(
        "Delivery",
        back_populates="order",
        uselist=False
    )
    review = relationship("OrderReview", back_populates="order", uselist=False)


class OrderReview(Base):
    __tablename__ = "order_reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_order_reviews_rating_range"),
    )

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    feedback = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="review")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(50), unique=True, nullable=False)
    vehicle_type = Column(String(50))
    capacity_kg = Column(Float)
    driver_name = Column(String(100))
    driver_phone = Column(String(20))


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))

    pickup_location = Column(String(255))
    delivery_location = Column(String(255))

    route = Column(Text)
    distance_km = Column(Float)

    status = Column(String(50), default="Pending")

    order = relationship("Order", back_populates="delivery")