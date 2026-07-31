import os

# Must be set before importing `app`: app.config reads DATABASE_URL at import
# time and create_app() binds the engine immediately, so the test suite uses
# an isolated in-memory SQLite database instead of the real MySQL database.
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

import pytest
from app import create_app, db


@pytest.fixture()
def app():
    application = create_app()
    application.config['TESTING'] = True
    application.config['JWT_SECRET_KEY'] = 'test-jwt-secret'
    application.config['GOOGLE_CLIENT_ID'] = ''
    with application.app_context():
        db.drop_all()
        db.create_all()
    yield application
    with application.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()
