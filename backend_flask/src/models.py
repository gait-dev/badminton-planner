from flask_sqlalchemy import SQLAlchemy
from passlib.hash import pbkdf2_sha256

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True)
    license_number = db.Column(db.String(20), unique=True)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    role = db.Column(db.String(20), default='user')  # 'admin' ou 'user'
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    __table_args__ = (
        db.CheckConstraint('email IS NOT NULL OR license_number IS NOT NULL', name='require_identifier'),
    )
    
    def set_password(self, password):
        self.password_hash = pbkdf2_sha256.hash(password)
    
    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.password_hash)
