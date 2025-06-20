from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import endpoints

app = FastAPI()

#CORS so chrome extension can make request
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"], #* will be replaced with the chrome extension id later
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

#register routes
app.include_router(endpoints.router)