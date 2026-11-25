# PillVision — Medical Pills Detection
A Flask web application using a custom YOLO11n model trained on the Ultralytics Medical Pills dataset (30 epochs, 640px, batch 8, class `pill`).

## Setup (Windows PowerShell)
1. Open this folder in VS Code. Use Python 3.11 or 3.12.
2. Run `python -m venv .venv`.
3. Run `.\.venv\Scripts\python.exe -m pip install -r requirements.txt`.
4. Open `notebooks/training.ipynb` in Google Colab. If needed, run training cells and download `best.pt` with the final cell.
5. Put `best.pt` inside `models/`.
6. Run `.\.venv\Scripts\python.exe app.py` and open http://127.0.0.1:5000.

## Workflow
HTML/CSS/JS sends an image and confidence threshold to Flask `/detect`. The server loads the trained weights, predicts at 640px, and returns an annotated PNG and detection data. The browser displays the image, count and confidence.

## Dataset
https://docs.ultralytics.com/datasets/detect/medical-pills/

## Notes
Weights are not included in this archive. Academic demonstration only: the model detects the single class `pill`; it cannot identify medication type or safety. Check the applicable Ultralytics AGPL-3.0 or enterprise license and dataset terms before publishing or distributing. GitHub hosts source code, not the running Python server. 
