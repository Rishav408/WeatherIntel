from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


MOCK_WEATHER = {
    "city": "Kolkata",
    "condition": "Hazy Sunlight",
    "temperature": 31,
    "humidity": 62,
    "wind_kph": 14,
    "feels_like": 35,
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/insights")
def insights():
    return render_template("insights.html")


@app.route("/maps")
def maps():
    return render_template("maps.html")


@app.route("/archives")
def archives():
    return render_template("archives.html")


@app.route("/weather")
def weather():
    city = request.args.get("city", MOCK_WEATHER["city"]).strip() or MOCK_WEATHER["city"]
    payload = {**MOCK_WEATHER, "city": city.title()}
    return jsonify(payload)


@app.route("/upload", methods=["GET", "POST"])
def upload():
    return jsonify(
        {
            "status": "placeholder",
            "message": "CSV upload endpoint will be implemented in Part 2.",
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
