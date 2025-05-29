from prosecco.config import db
from prosecco.config import Device_state
from datetime import datetime, timezone

class Device(db.Model):
    
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(128), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    locale = db.Column(db.String(128), nullable=True, default='geral')
    group = db.Column(db.String(128), nullable=True, default='geral')
    a_state = db.Column(db.Enum(Device_state, name='device_state'), nullable=False, default=Device_state.ACTIVE)

    dt_created = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    dt_updated = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', back_populates='devices')


    def to_dict(self):
        return {
            'id': self.id,
            'ip': self.ip,
            'locale': self.locale,
            'group': self.group,
            'a_state': self.a_state.name
        }
