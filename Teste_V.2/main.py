from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pandas as pd
import io
import os

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route('/api/feedback', methods=['POST'])
def create_feedback():
    data = request.json
    if not data or 'rating' not in data:
        return jsonify({"message": "Invalid input"}), 400
    
    entry = Feedback(rating=data['rating'])
    db.session.add(entry)
    db.session.commit()
    
    return jsonify({
        "id": entry.id,
        "rating": entry.rating,
        "createdAt": entry.created_at.isoformat()
    }), 201

@app.route('/api/feedback', methods=['GET'])
def list_feedback():
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    total = Feedback.query.count()
    items = Feedback.query.order_by(Feedback.created_at.desc()).limit(limit).offset(offset).all()
    
    return jsonify({
        "items": [{
            "id": i.id,
            "rating": i.rating,
            "createdAt": i.created_at.isoformat()
        } for i in items],
        "total": total
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    filter_type = request.args.get('filter', 'today')
    query = Feedback.query
    
    if filter_type == 'today':
        today = datetime.utcnow().date()
        query = query.filter(db.func.date(Feedback.created_at) == today)
    
    items = query.all()
    total = len(items)
    
    breakdown = {
        "very_satisfied": len([i for i in items if i.rating == 'very_satisfied']),
        "satisfied": len([i for i in items if i.rating == 'satisfied']),
        "dissatisfied": len([i for i in items if i.rating == 'dissatisfied'])
    }
    
    total_all = Feedback.query.count() or 1
    percentages = {
        k: f"{(v/total*100):.1f}%" if total > 0 else "0.0%"
        for k, v in breakdown.items()
    }
    
    # Simple daily aggregation for the chart
    daily_counts = db.session.query(
        db.func.date(Feedback.created_at).label('date'),
        db.func.count(Feedback.id).label('count')
    ).group_by(db.func.date(Feedback.created_at)).order_by(db.func.date(Feedback.created_at)).all()

    return jsonify({
        "total": total,
        "breakdown": breakdown,
        "percentages": percentages,
        "dailyCounts": [{"date": str(d.date), "count": d.count} for d in daily_counts]
    })

@app.route('/api/export/<fmt>', methods=['GET'])
def export_data(fmt):
    items = Feedback.query.order_by(Feedback.created_at.desc()).all()
    
    rating_map = {
        'very_satisfied': 'muito satisfeito',
        'satisfied': 'satisfeito',
        'dissatisfied': 'insatisfeito'
    }

    if fmt == 'csv':
        df_list = []
        for i in items:
            df_list.append({
                "ID": i.id,
                "Feedback": rating_map.get(i.rating, i.rating),
                "Data": i.created_at.strftime('%d/%m/%Y'),
                "Hora": i.created_at.strftime('%H:%M:%S')
            })
        df = pd.DataFrame(df_list)
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name='feedback.csv'
        )
    elif fmt == 'txt':
        lines = []
        for i in items:
            rating_label = rating_map.get(i.rating, i.rating)
            lines.append(f"ID:{i.id} Feedback:{rating_label} Data:{i.created_at.strftime('%d/%m/%Y %H:%M:%S')}")
        txt_content = "\n".join(lines)
        return send_file(
            io.BytesIO(txt_content.encode()),
            mimetype='text/plain',
            as_attachment=True,
            download_name='feedback.txt'
        )
    
    return "Invalid format", 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) # Backend on 5001
