import os
from datetime import datetime
from typing import Optional
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.models.medical import Prediction, Disease, MedicalReport
from backend.ml.predict import get_disease_details

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated_reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_report(prediction_id: int, patient_id: int, db: Session) -> Optional[MedicalReport]:
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == patient_id,
    ).first()

    if not prediction:
        return None

    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        return None

    disease_details = None
    if prediction.predicted_disease:
        disease_details = get_disease_details(prediction.predicted_disease, db)

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=22,
        spaceAfter=12,
        textColor=colors.HexColor("#1a73e8"),
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        spaceAfter=8,
        textColor=colors.HexColor("#333333"),
    )
    normal_style = ParagraphStyle(
        "CustomNormal",
        parent=styles["Normal"],
        fontSize=11,
        spaceAfter=6,
        leading=16,
    )

    elements = []
    elements.append(Paragraph("MediAssist AI - Medical Report", title_style))
    elements.append(Spacer(1, 0.2 * inch))

    report_date = prediction.created_at.strftime("%Y-%m-%d %H:%M") if prediction.created_at else datetime.now().strftime("%Y-%m-%d %H:%M")
    elements.append(Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
    elements.append(Spacer(1, 0.15 * inch))

    patient_data = [
        ["Patient Name", patient.full_name],
        ["Patient ID", str(patient.id)],
        ["Email", patient.email],
        ["Report Date", report_date],
    ]
    patient_table = Table(patient_data, colWidths=[2 * inch, 4 * inch])
    patient_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0f4f8")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#333333")),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ALIGN", (0, 0), (0, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 0.2 * inch))

    elements.append(Paragraph("Symptoms", heading_style))
    symptoms_list = prediction.symptoms.split(",") if prediction.symptoms else []
    for symptom in symptoms_list:
        elements.append(Paragraph(f"• {symptom.strip()}", normal_style))
    elements.append(Spacer(1, 0.15 * inch))

    elements.append(Paragraph("Prediction Results", heading_style))
    result_data = [
        ["Predicted Condition", prediction.predicted_disease or "Not identified"],
        ["Confidence Level", f"{prediction.confidence * 100:.1f}%" if prediction.confidence else "N/A"],
        ["Emergency Case", "Yes" if prediction.was_emergency else "No"],
    ]
    result_table = Table(result_data, colWidths=[2 * inch, 4 * inch])
    result_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8f5e9")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#333333")),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(result_table)
    elements.append(Spacer(1, 0.2 * inch))

    if disease_details:
        if disease_details.get("description"):
            elements.append(Paragraph("Description", heading_style))
            elements.append(Paragraph(disease_details["description"], normal_style))
            elements.append(Spacer(1, 0.1 * inch))

        if disease_details.get("causes"):
            elements.append(Paragraph("Possible Causes", heading_style))
            elements.append(Paragraph(disease_details["causes"], normal_style))
            elements.append(Spacer(1, 0.1 * inch))

        if disease_details.get("treatment"):
            elements.append(Paragraph("Treatment", heading_style))
            elements.append(Paragraph(disease_details["treatment"], normal_style))
            elements.append(Spacer(1, 0.1 * inch))

        if disease_details.get("medicines"):
            elements.append(Paragraph("Recommended Medicines", heading_style))
            for med in disease_details["medicines"]:
                med_text = f"• {med['name']}"
                if med.get("dosage"):
                    med_text += f" - {med['dosage']}"
                if med.get("usage_instructions"):
                    med_text += f" ({med['usage_instructions']})"
                elements.append(Paragraph(med_text, normal_style))
            elements.append(Spacer(1, 0.1 * inch))

        if disease_details.get("precautions"):
            elements.append(Paragraph("Precautions", heading_style))
            elements.append(Paragraph(disease_details["precautions"], normal_style))
            elements.append(Spacer(1, 0.1 * inch))

        if disease_details.get("diet_suggestions"):
            elements.append(Paragraph("Diet Suggestions", heading_style))
            elements.append(Paragraph(disease_details["diet_suggestions"], normal_style))
            elements.append(Spacer(1, 0.1 * inch))

        if disease_details.get("when_to_see_doctor"):
            elements.append(Paragraph("When to See a Doctor", heading_style))
            elements.append(Paragraph(disease_details["when_to_see_doctor"], normal_style))

    elements.append(Spacer(1, 0.3 * inch))
    disclaimer = Paragraph(
        "<i>Disclaimer: This report is generated by MediAssist AI and is for informational purposes only. "
        "It does not replace professional medical advice, diagnosis, or treatment. "
        "Always consult a qualified healthcare provider for medical concerns.</i>",
        ParagraphStyle("Disclaimer", parent=normal_style, fontSize=9, textColor=colors.HexColor("#888888")),
    )
    elements.append(disclaimer)

    doc.build(elements)
    buffer.seek(0)

    filename = f"report_{patient_id}_{prediction_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(buffer.getvalue())

    report_record = MedicalReport(
        prediction_id=prediction_id,
        patient_id=patient_id,
        report_url=filepath,
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return report_record
