class DomainException(Exception):
    """Base class for domain exceptions"""
    pass

class EntityNotFoundError(DomainException):
    """Raised when a requested entity does not exist"""
    def __init__(self, message: str = "Entity not found"):
        self.message = message
        super().__init__(self.message)

class ValidationError(DomainException):
    """Raised when inputs fail business validation rules"""
    def __init__(self, message: str = "Validation failed"):
        self.message = message
        super().__init__(self.message)
