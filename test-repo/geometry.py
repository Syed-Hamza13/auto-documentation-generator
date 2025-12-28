import math

class Circle:
    """Circle class for calculating area and circumference."""
    
    def __init__(self, radius):
        """Initialize circle with radius."""
        self.radius = radius
    
    def area(self):
        """Calculate area of circle."""
        return math.pi * (self.radius ** 2)
    
    def circumference(self):
        """Calculate circumference of circle."""
        return 2 * math.pi * self.radius

class Rectangle:
    """Rectangle class for calculating area and perimeter."""
    
    def __init__(self, width, height):
        """Initialize rectangle with width and height."""
        self.width = width
        self.height = height
    
    def area(self):
        """Calculate area of rectangle."""
        return self.width * self.height
    
    def perimeter(self):
        """Calculate perimeter of rectangle."""
        return 2 * (self.width + self.height)
