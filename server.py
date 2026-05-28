import json
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile

from classify_module.classify_segment import ShapeClassifier
from classify_module.createForm import make_form_data_item
from classify_module.segmentation import segment_connected_components


ROOT_DIR = Path(__file__).resolve().parent
CLASSIFY_MODULE_DIR = ROOT_DIR / 'classify_module'
MODEL_PATH = CLASSIFY_MODULE_DIR / 'shape_classifier_cnn.pth'
METADATA_OUTPUT_PATH = CLASSIFY_MODULE_DIR / 'form_data.json'
DEBUG_SEGMENTS_DIR = CLASSIFY_MODULE_DIR / 'debug_segments'
DEFAULT_TILE_COUNT = 50

app = FastAPI(title='Level Editor Recognition API')
classifier: ShapeClassifier | None = None


def get_classifier():
    global classifier

    if classifier is None:
        if not MODEL_PATH.exists():
            raise HTTPException(
                status_code=500,
                detail=f'Model file not found: {MODEL_PATH}',
            )

        classifier = ShapeClassifier(str(MODEL_PATH))

    return classifier


def decode_upload_image(content: bytes):
    image_buffer = np.frombuffer(content, dtype=np.uint8)
    image = cv2.imdecode(image_buffer, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(
            status_code=400,
            detail='Uploaded image could not be decoded.',
        )

    return image


def write_metadata_file(metadata_list):
    with METADATA_OUTPUT_PATH.open('w', encoding='utf-8') as file:
        json.dump(metadata_list, file, ensure_ascii=False, indent=4)


@app.post('/api/recognitions')
async def create_recognition(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail='Request field "image" must be an image file.',
        )

    content = await image.read()

    if not content:
        raise HTTPException(status_code=400, detail='Uploaded image is empty.')

    uploaded_image = decode_upload_image(content)
    segments = segment_connected_components(
        uploaded_image,
        debug_dir=str(DEBUG_SEGMENTS_DIR),
    )
    current_classifier = get_classifier()
    original_height, original_width = uploaded_image.shape[:2]
    metadata_list = []

    for segment in segments:
        segment_type = current_classifier.predict_crop(segment['crop'])
        metadata, _file_item = make_form_data_item(
            segment=segment,
            segment_type=segment_type,
            original_height=original_height,
            original_width=original_width,
            tile_count=DEFAULT_TILE_COUNT,
        )

        metadata_list.append(metadata)

    write_metadata_file(metadata_list)

    return {
        'ok': True,
        'segment_count': len(segments),
        'metadata_count': len(metadata_list),
        'metadata_path': str(METADATA_OUTPUT_PATH),
    }
