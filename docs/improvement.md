# ChronoNutrition Production Readiness Refactor

You are a senior Staff Software Engineer and Solution Architect.

Your task is to transform this FastAPI backend from a prototype/MVP into a production-ready nutrition platform that can support thousands of users, future mobile applications, AI integrations, and continuous feature expansion.

Do not make superficial changes.

Perform a complete architectural review and generate an implementation plan before modifying code.

## Current Problems

The current backend has several production blockers:

1. Business logic is embedded directly inside FastAPI route handlers.
2. Recommendation engine is based on hardcoded food IDs and if/else statements.
3. Nutrition data is embedded inside a massive Python seed file.
4. Database schema is not normalized.
5. Vitamin and mineral amounts are stored as strings instead of structured values.
6. Medical recommendation logic is mixed with API logic.
7. No authentication or user management.
8. No personalization engine.
9. No caching strategy.
10. No observability or monitoring.
11. No migration strategy.
12. No automated testing.
13. No API versioning.
14. No service layer abstraction.
15. No repository pattern.
16. No domain-driven separation.

## Target Architecture

Refactor into the following structure:

backend/

api/
v1/
foods.py
recommendations.py
planner.py
chat.py
users.py

services/
food_service.py
recommendation_service.py
planner_service.py
nutrition_service.py
chat_service.py
user_service.py

repositories/
food_repository.py
nutrition_repository.py
user_repository.py

models/

schemas/

core/
config.py
security.py
logging.py
exceptions.py

data/
foods.json
food_benefits.json
vitamins.json
minerals.json

ai/
gemini_client.py

tests/

migrations/

main.py

## Database Refactoring

Redesign the schema.

### Food

Store only food-related information.

### Nutrition

Store numerical values.

Example:

calories FLOAT
protein FLOAT
carbs FLOAT
fat FLOAT
fiber FLOAT

### Vitamin

Replace:

amount = "53.2 mg"

with

amount_value FLOAT
unit STRING

Example:

53.2
mg

### Mineral

Use same structure.

### Evidence

Create separate table.

Evidence:
id
food_id
title
url
source_type

A food can have multiple evidence sources.

### FoodGoalScore

Create a recommendation mapping table.

food_id
goal
score

Example:

kiwi
sleep
10

walnuts
sleep
8

pumpkin_seeds
sleep
9

Recommendation logic must query data instead of using hardcoded if statements.

## Recommendation Engine

Remove all hardcoded food ID scoring logic.

Create a RecommendationService.

RecommendationService must:

- Support configurable scoring
- Support weighted ranking
- Support future machine learning models
- Support user personalization

Design scoring so that new foods can be added without code changes.

## Personalization Engine

Create a UserProfile model.

Fields:

age
gender
height
weight
activity_level
diet_type
allergies
goals
sleep_schedule

Recommendations must be personalized using profile data.

## AI Layer

Move Gemini integration into a dedicated AI service.

Create:

ai/gemini_client.py

Create:

ChatService

Responsibilities:

- Intent classification
- Food recommendation generation
- Nutritional question answering

The API route must not contain AI logic.

## Medical Safety Layer

Review all health-related responses.

Replace:

"likely deficiencies"

with

"possible nutritional factors associated with symptoms"

Ensure the platform never claims diagnosis.

Add medical disclaimer middleware or reusable response component.

## Authentication

Implement:

- JWT authentication
- User registration
- Login
- Refresh tokens
- Password hashing using bcrypt

Create role support:

user
admin

## API Design

Version all APIs.

Example:

/api/v1/foods
/api/v1/recommendations

Create consistent response format.

Example:

{
  "success": true,
  "data": {},
  "message": ""
}

## Performance

Implement:

- Pagination
- Query optimization
- Database indexes
- Lazy loading where appropriate

Avoid querying all foods into memory.

Review every endpoint for N+1 query issues.

## Caching

Implement Redis caching for:

food catalog
recommendations
popular searches

## Observability

Add:

- Structured logging
- Request tracing
- Error tracking
- Health check endpoint

Example:

/health
/ready

## Deployment

Create:

Dockerfile

docker-compose.yml

Environment configuration.

Support:

Development
Staging
Production

## Database Migration

Implement Alembic migrations.

Remove destructive startup behavior.

The application must never:

drop_all()
create_all()

during startup.

## Testing

Add:

- Unit tests
- Integration tests
- Service tests
- API tests

Target minimum coverage:

80%

## Security

Implement:

- Input validation
- Rate limiting
- CORS review
- Secure headers
- Secret management

## Documentation

Generate:

- OpenAPI descriptions
- Architecture documentation
- Deployment guide
- ER diagram

## Deliverables

Produce:

1. Architecture review
2. Database redesign
3. Migration strategy
4. Refactoring roadmap
5. New folder structure
6. Updated schema design
7. API redesign proposal
8. Security review
9. Deployment architecture
10. Step-by-step implementation plan

Prioritize maintainability, scalability, security, and long-term product growth over quick fixes.

## The production target should look closer to:
Frontend (Next.js)

        ↓

API Gateway / Nginx

        ↓

FastAPI Application

        ↓

PostgreSQL

        ↓

Redis

        ↓

Gemini/OpenAI

        ↓

Background Workers
(Celery/RQ)