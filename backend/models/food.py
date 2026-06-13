from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Food(Base):
    __tablename__ = "foods"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    scientific_name = Column(String)
    category = Column(String)  # fruits, vegetables, herbs_spices, nuts_seeds
    image = Column(String)
    description = Column(String)
    glycemic_index = Column(Integer)
    water_content = Column(Float)
    antioxidant_score = Column(Integer)
    best_time_to_eat = Column(String)
    avoid_time = Column(String)

    nutrition = relationship("Nutrition", uselist=False, back_populates="food", cascade="all, delete-orphan")
    vitamins = relationship("Vitamin", back_populates="food", cascade="all, delete-orphan")
    minerals = relationship("Mineral", back_populates="food", cascade="all, delete-orphan")
    benefits = relationship("Benefit", back_populates="food", cascade="all, delete-orphan")
    evidences = relationship("Evidence", back_populates="food", cascade="all, delete-orphan")
    goal_scores = relationship("FoodGoalScore", back_populates="food", cascade="all, delete-orphan")

class Nutrition(Base):
    __tablename__ = "nutrition"

    food_id = Column(String, ForeignKey("foods.id"), primary_key=True)
    calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fats = Column(Float)
    fiber = Column(Float)
    sugar = Column(Float)

    food = relationship("Food", back_populates="nutrition")

class Vitamin(Base):
    __tablename__ = "vitamins"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(String, ForeignKey("foods.id"))
    name = Column(String)
    amount_value = Column(Float)
    unit = Column(String)

    food = relationship("Food", back_populates="vitamins")

class Mineral(Base):
    __tablename__ = "minerals"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(String, ForeignKey("foods.id"))
    name = Column(String)
    amount_value = Column(Float)
    unit = Column(String)

    food = relationship("Food", back_populates="minerals")

class Benefit(Base):
    __tablename__ = "benefits"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(String, ForeignKey("foods.id"))
    title = Column(String)
    description = Column(String)
    evidence_links = Column(String)

    food = relationship("Food", back_populates="benefits")

class Evidence(Base):
    __tablename__ = "evidences"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(String, ForeignKey("foods.id"))
    title = Column(String)
    url = Column(String)
    source_type = Column(String)

    food = relationship("Food", back_populates="evidences")

class FoodGoalScore(Base):
    __tablename__ = "food_goal_scores"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(String, ForeignKey("foods.id"))
    goal = Column(String, index=True)
    score = Column(Integer)
    quantity = Column(String, default="100g")
    reasons = Column(String)  # JSON-encoded array of strings

    food = relationship("Food", back_populates="goal_scores")
