import io

import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from tensorflow.keras.models import load_model


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = load_model("signature_model.h5")


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.convert("L")
    image = image.resize((128, 128))
    img_array = np.asarray(image, dtype="float32") / 255.0
    img_array = img_array.reshape(1, 128, 128, 1)
    return img_array


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    x = preprocess_image(image)
    prob = float(model.predict(x)[0][0])
    label = "real" if prob < 0.5 else "forged"
    return {"label": label, "score": prob}

