from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router

app = FastAPI(
    title = "GIN DAI MAI Thai food allergen api",
    description = "เว็บไซต์วิเคราะห์ส่วนผสมจากภาพถ่ายอาหารพร้อมประเมิณระดับความเสี่ยงการแพ้อาหารจากสารก่อภูมิแพ้",
    version = "1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
    
)

api.include_router(router)

app.get("/")
def root():
    return {"status": 200, "message": "GIN DAI MAI Thai food allergen api is running..."}

