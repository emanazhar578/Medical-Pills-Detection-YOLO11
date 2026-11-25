from flask import Flask, render_template, request, jsonify
from ultralytics import YOLO
from PIL import Image, ImageOps
from pathlib import Path
from threading import Lock
import io, base64

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 20_000_000
WEIGHTS = Path(__file__).resolve().parent / 'models' / 'best.pt'
model = None
lock = Lock()

@app.get('/')
def index():
    return render_template('index.html')

@app.post('/detect')
def detect():
    global model
    if not WEIGHTS.is_file():
        return jsonify(error='Place your trained best.pt in the models folder first.'), 503
    try:
        uploaded = request.files.get('image')
        if not uploaded:
            return jsonify(error='Please upload an image.'), 400
        with Image.open(uploaded.stream) as source:
            if source.width * source.height > 20_000_000:
                return jsonify(error='Image is too large.'), 400
            img = ImageOps.exif_transpose(source).convert('RGB')
        conf = float(request.form.get('confidence', 0.25))
        if not 0.05 <= conf <= 0.95:
            return jsonify(error='Invalid confidence threshold.'), 400
    except (ValueError, OSError, Image.DecompressionBombError):
        return jsonify(error='Invalid image or confidence value.'), 400
    try:
        with lock:
            if model is None:
                model = YOLO(str(WEIGHTS))
            result = model.predict(img, conf=conf, imgsz=640, verbose=False)[0]
        detections = [{'label': result.names[int(b.cls.item())], 'confidence': round(b.conf.item()*100, 2), 'box': [round(v) for v in b.xyxy[0].tolist()]} for b in result.boxes]
        buffer = io.BytesIO()
        Image.fromarray(result.plot()[..., ::-1]).save(buffer, format='PNG')
        return jsonify(count=len(detections), detections=detections, image='data:image/png;base64,'+base64.b64encode(buffer.getvalue()).decode('ascii'))
    except Exception:
        app.logger.exception('Detection failed')
        return jsonify(error='Detection failed. Check the terminal and model weights.'), 500

@app.errorhandler(413)
def too_large(error):
    return jsonify(error='Image must be under 10 MB.'), 413

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
