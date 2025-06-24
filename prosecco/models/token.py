from prosecco.config import db


class Token(db.Model):
    __tablename__ = 'tokens'
    
    token = db.Column(db.String, primary_key=True, index=True)
    valid = db.Column(db.Integer, default=0)
    