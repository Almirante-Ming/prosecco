from prosecco.config import db
from prosecco.config import File_state
from datetime import datetime, timezone

class File_trk(db.Model):
    __tablename__ = 'files_trk'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(128), nullable=False)
    filepath = db.Column(db.String(128), nullable=False)
    file_state = db.Column(db.Enum(File_state, name='file_state'), nullable=False, default=File_state.UPLOADED)

    dt_created = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    dt_updated = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', back_populates='files')
