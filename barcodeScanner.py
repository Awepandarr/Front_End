from flask import Flask, Response, render_template, jsonify
import cv2
from pyzbar.pyzbar import decode
import threading
import requests
import atexit
import time

app = Flask(__name__)

# Web service URL (replace with your actual URL)
url = "http://localhost:8080/product"  # Your Java web service endpoint

# Initialize the camera (adjust the index as needed)
cap = cv2.VideoCapture(1)  # Try 0 if 1 does not work
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

if not cap.isOpened():
    print("Error: Could not access the camera.")
    exit()

# Global variables to hold the latest frame and barcode data
output_frame = None
frame_lock = threading.Lock()
latest_barcode_data = None

def camera_loop():
    """
    Continuously capture frames from the camera, draw a guiding rectangle,
    perform barcode scanning, and update the global output frame.
    """
    global output_frame, latest_barcode_data
    guiding_box_start = (100, 100)
    guiding_box_end = (540, 380)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Draw a guiding rectangle (green box) on the frame
        cv2.rectangle(frame, guiding_box_start, guiding_box_end, (0, 255, 0), 2)

        # Decode barcodes in the frame
        barcodes = decode(frame)
        if barcodes:
            # Process the first detected barcode
            barcode = barcodes[0]
            barcode_data = barcode.data.decode("utf-8")
            barcode_type = barcode.type
            latest_barcode_data = {"data": barcode_data, "type": barcode_type}
            print("Detected barcode:", barcode_data)
            # Send barcode data to the web service
            try:
                response = requests.get(url, params={"barcode": barcode_data}, timeout=5)
                if response.status_code == 200:
                    print("Product Information:", response.json())
                else:
                    print("Error: Could not fetch product data, status code:", response.status_code)
            except Exception as e:
                print("Exception during web service call:", e)

            # Delay to avoid sending multiple requests for the same barcode
            time.sleep(2)

        # Update the global output_frame with the processed frame
        with frame_lock:
            output_frame = frame.copy()

        # Optional: a small delay to reduce CPU usage (adjust as needed)
        time.sleep(0.03)

# Start the camera loop in a separate daemon thread
camera_thread = threading.Thread(target=camera_loop)
camera_thread.daemon = True
camera_thread.start()

def generate_frames():
    """
    Generator function that encodes the latest frame as JPEG and yields it
    in a multipart response format suitable for streaming.
    """
    global output_frame
    while True:
        with frame_lock:
            if output_frame is None:
                continue
            ret, buffer = cv2.imencode('.jpg', output_frame)
            if not ret:
                continue
            frame_bytes = buffer.tobytes()

        # Yield frame in multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    """Render the main page that displays the video stream."""
    return render_template('live.html')  # Change 'index.html' to 'live.html'

@app.route('/video_feed')
def video_feed():
    """Route that provides the MJPEG stream."""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/latest_barcode', methods=['GET'])
def get_latest_barcode():
    """Return the most recently detected barcode data as JSON."""
    if latest_barcode_data:
        return jsonify(latest_barcode_data)
    else:
        print("No barcode detected yet"+str(latest_barcode_data))
        return jsonify({"error": "No barcode detected yet"}), 404

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health-check endpoint."""
    return jsonify({"status": "OK"})

def release_camera():
    """Release the camera and close any OpenCV windows when exiting."""
    if cap.isOpened():
        cap.release()
    cv2.destroyAllWindows()

atexit.register(release_camera)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
