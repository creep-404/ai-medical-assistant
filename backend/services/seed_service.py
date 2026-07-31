from sqlalchemy.orm import Session
from backend.database.database import SessionLocal
from backend.models.medical import Symptom, Disease, Medicine, disease_symptom_association, disease_medicine_association
from backend.models.user import User, DoctorProfile, UserRole
from backend.auth.auth_handler import hash_password


def seed_symptoms(db: Session):
    symptoms_data = [
        {"name": "Fever", "description": "Elevated body temperature above 38°C", "is_emergency": False},
        {"name": "Cough", "description": "Persistent coughing, may be dry or productive", "is_emergency": False},
        {"name": "Headache", "description": "Pain in the head or upper neck", "is_emergency": False},
        {"name": "Fatigue", "description": "Extreme tiredness and lack of energy", "is_emergency": False},
        {"name": "Body Ache", "description": "Generalized muscle pain throughout the body", "is_emergency": False},
        {"name": "Sore Throat", "description": "Pain or irritation in the throat", "is_emergency": False},
        {"name": "Runny Nose", "description": "Excess nasal discharge", "is_emergency": False},
        {"name": "Sneezing", "description": "Expelling air from nose involuntarily", "is_emergency": False},
        {"name": "Nausea", "description": "Feeling of sickness with urge to vomit", "is_emergency": False},
        {"name": "Vomiting", "description": "Forceful expulsion of stomach contents", "is_emergency": False},
        {"name": "Diarrhea", "description": "Loose, watery stools occurring frequently", "is_emergency": False},
        {"name": "Abdominal Pain", "description": "Pain in the stomach or belly area", "is_emergency": False},
        {"name": "Chest Pain", "description": "Discomfort or pain in the chest area", "is_emergency": True},
        {"name": "Shortness of Breath", "description": "Difficulty breathing or feeling breathless", "is_emergency": True},
        {"name": "Dizziness", "description": "Feeling lightheaded or unsteady", "is_emergency": False},
        {"name": "Skin Rash", "description": "Red, irritated area of skin", "is_emergency": False},
        {"name": "Joint Pain", "description": "Pain in one or more joints", "is_emergency": False},
        {"name": "Back Pain", "description": "Pain in the lower or upper back", "is_emergency": False},
        {"name": "Neck Pain", "description": "Pain or stiffness in the neck area", "is_emergency": False},
        {"name": "Pale Skin", "description": "Unusually light or pale skin color", "is_emergency": False},
        {"name": "Loss of Appetite", "description": "Decreased desire to eat", "is_emergency": False},
        {"name": "Weight Loss", "description": "Unintentional decrease in body weight", "is_emergency": False},
        {"name": "Blurred Vision", "description": "Loss of sharpness of vision", "is_emergency": False},
        {"name": "Frequent Urination", "description": "Needing to urinate more often than usual", "is_emergency": False},
        {"name": "Excessive Thirst", "description": "Abnormally strong desire to drink", "is_emergency": False},
        {"name": "Numbness", "description": "Loss of sensation in body parts", "is_emergency": False},
        {"name": "Swelling", "description": "Enlargement of body parts due to fluid", "is_emergency": False},
        {"name": "Constipation", "description": "Infrequent or difficult bowel movements", "is_emergency": False},
        {"name": "Indigestion", "description": "Discomfort in upper abdomen", "is_emergency": False},
        {"name": "Anxiety", "description": "Feeling of worry or unease", "is_emergency": False},
        {"name": "Insomnia", "description": "Difficulty falling or staying asleep", "is_emergency": False},
        {"name": "Ear Pain", "description": "Pain or discomfort in the ear", "is_emergency": False},
        {"name": "High Blood Pressure", "description": "Elevated blood pressure readings", "is_emergency": False},
        {"name": "Palpitations", "description": "Irregular or rapid heartbeat sensation", "is_emergency": False},
        {"name": "Loss of Consciousness", "description": "Temporary loss of consciousness or fainting", "is_emergency": True},
        {"name": "Confusion", "description": "State of being bewildered or unclear", "is_emergency": True},
        {"name": "Seizures", "description": "Sudden, uncontrolled electrical disturbance in the brain", "is_emergency": True},
    ]

    for sym_data in symptoms_data:
        existing = db.query(Symptom).filter(Symptom.name == sym_data["name"]).first()
        if not existing:
            db.add(Symptom(**sym_data))
    db.commit()


def seed_diseases(db: Session):
    diseases_data = [
        {
            "name": "Common Cold",
            "description": "A viral infection of the upper respiratory tract causing mild illness with runny nose, sneezing, and sore throat.",
            "causes": "Caused by rhinoviruses, coronaviruses, and other respiratory viruses transmitted through airborne droplets or direct contact.",
            "treatment": "Rest, hydration, over-the-counter cold medications for symptom relief.",
            "precautions": "Wash hands frequently, avoid close contact with infected individuals, cover mouth when coughing or sneezing.",
            "home_remedies": "Warm salt water gargle, honey and lemon tea, steam inhalation, ginger tea.",
            "recovery_time": "7-10 days",
            "diet_suggestions": "Warm soups, herbal teas, citrus fruits rich in Vitamin C, warm broths, honey.",
            "hydration_advice": "Drink 8-10 glasses of water daily. Warm fluids like soups and herbal teas are especially beneficial.",
            "when_to_see_doctor": "If symptoms persist beyond 10 days, high fever, difficulty breathing, or severe sinus pain.",
        },
        {
            "name": "Influenza",
            "description": "A contagious respiratory illness caused by influenza viruses, more severe than common cold.",
            "causes": "Influenza A and B viruses spread through respiratory droplets from coughs and sneezes.",
            "treatment": "Antiviral medications (oseltamivir), rest, fever reducers, and plenty of fluids.",
            "precautions": "Annual flu vaccination, avoid crowded places during outbreaks, wear mask, hand hygiene.",
            "home_remedies": "Rest in bed, warm fluids, honey with warm water, turmeric milk, steam therapy.",
            "recovery_time": "1-2 weeks",
            "diet_suggestions": "Light easily digestible foods, chicken soup, vegetable broths, fruits rich in vitamin C, ginger.",
            "hydration_advice": "Drink at least 10-12 glasses of fluids daily including water, electrolyte solutions, and herbal teas.",
            "when_to_see_doctor": "Difficulty breathing, persistent high fever, chest pain, severe weakness, or symptoms worsening.",
        },
        {
            "name": "COVID-19",
            "description": "A contagious disease caused by SARS-CoV-2 virus affecting the respiratory system.",
            "causes": "SARS-CoV-2 virus transmitted through respiratory droplets, aerosols, and contaminated surfaces.",
            "treatment": "Supportive care, antivirals (paxlovid), corticosteroids for severe cases, oxygen therapy if needed.",
            "precautions": "Vaccination, wearing masks, social distancing, hand hygiene, proper ventilation.",
            "home_remedies": "Isolation, rest, steam inhalation, warm salt water gargle, hydration.",
            "recovery_time": "2-6 weeks depending on severity",
            "diet_suggestions": "Nutritious diet rich in proteins, vitamin C, zinc. Include eggs, citrus fruits, leafy greens, nuts.",
            "hydration_advice": "Drink 10-12 glasses of water daily. Include coconut water, fresh juices, and soups.",
            "when_to_see_doctor": "Difficulty breathing, persistent chest pain, confusion, bluish lips or face, high fever for more than 3 days.",
        },
        {
            "name": "Migraine",
            "description": "A neurological condition causing severe throbbing pain usually on one side of the head.",
            "causes": "Genetic and environmental factors, triggered by stress, hormonal changes, certain foods, sleep changes, and sensory stimuli.",
            "treatment": "Pain relievers, triptans, anti-nausea medications, preventive medications for chronic cases.",
            "precautions": "Identify and avoid triggers, maintain regular sleep schedule, manage stress, avoid skipping meals.",
            "home_remedies": "Rest in dark quiet room, cold compress on forehead, gentle neck massage, peppermint oil application.",
            "recovery_time": "4-72 hours per episode",
            "diet_suggestions": "Avoid trigger foods (aged cheese, processed meats, caffeine, alcohol). Eat small frequent meals. Include magnesium-rich foods.",
            "hydration_advice": "Stay hydrated with 8 glasses of water daily. Avoid dehydration which can trigger migraines.",
            "when_to_see_doctor": "Frequent migraines affecting daily life, new pattern of headaches, headache with fever or stiff neck.",
        },
        {
            "name": "Tension Headache",
            "description": "Mild to moderate head pain with a feeling of tightness or pressure around the forehead.",
            "causes": "Stress, muscle tension in neck and scalp, poor posture, anxiety, fatigue, and eye strain.",
            "treatment": "Over-the-counter pain relievers (ibuprofen, acetaminophen), stress management techniques.",
            "precautions": "Maintain good posture, take breaks from screens, practice stress reduction, regular exercise.",
            "home_remedies": "Warm or cold compress, gentle stretching, massage, relaxation techniques, adequate sleep.",
            "recovery_time": "30 minutes to several hours",
            "diet_suggestions": "Balanced meals, limit caffeine, avoid skipping meals. Magnesium-rich foods like almonds and spinach.",
            "hydration_advice": "Drink adequate water throughout the day. Dehydration is a common trigger.",
            "when_to_see_doctor": "Headaches become more frequent or severe, interfere with daily activities, or are accompanied by vision changes.",
        },
        {
            "name": "Gastroenteritis",
            "description": "Inflammation of the stomach and intestines causing diarrhea, vomiting, and abdominal cramps.",
            "causes": "Viral infections (norovirus, rotavirus), bacterial infections (E. coli, Salmonella), or food poisoning.",
            "treatment": "Oral rehydration therapy, anti-diarrheal medications, rest, gradual return to normal diet.",
            "precautions": "Wash hands thoroughly, cook food properly, drink clean water, avoid contaminated food.",
            "home_remedies": "Oral rehydration solution, ginger tea, plain rice water, bananas, toast, probiotics like yogurt.",
            "recovery_time": "3-7 days",
            "diet_suggestions": "BRAT diet (Bananas, Rice, Applesauce, Toast). Avoid dairy, fatty foods, caffeine, and spicy foods.",
            "hydration_advice": "Critical - drink oral rehydration solution or clear fluids frequently. At least 8-10 glasses daily to replace lost fluids.",
            "when_to_see_doctor": "Blood in stool, severe dehydration signs, fever above 102°F, inability to keep fluids down for more than 24 hours.",
        },
        {
            "name": "Hypertension",
            "description": "Chronic medical condition with persistently elevated blood pressure in the arteries.",
            "causes": "Genetics, high salt intake, obesity, lack of physical activity, stress, smoking, excessive alcohol, age.",
            "treatment": "Lifestyle modifications, antihypertensive medications (ACE inhibitors, beta-blockers, diuretics).",
            "precautions": "Reduce salt intake, maintain healthy weight, regular exercise, limit alcohol, quit smoking.",
            "home_remedies": "Regular blood pressure monitoring, stress reduction through meditation, garlic in diet, hibiscus tea.",
            "recovery_time": "Lifelong management condition",
            "diet_suggestions": "DASH diet - low sodium, rich in fruits, vegetables, whole grains, lean proteins. Limit processed foods.",
            "hydration_advice": "Drink 8 glasses of water daily. Limit caffeine and avoid sugary drinks. Reduce sodium intake.",
            "when_to_see_doctor": "Blood pressure consistently above 140/90, severe headache, chest pain, shortness of breath, vision changes.",
        },
        {
            "name": "Diabetes Type 2",
            "description": "Chronic condition affecting how the body processes blood sugar with insulin resistance.",
            "causes": "Genetics, obesity, physical inactivity, poor diet, age, family history, ethnic background.",
            "treatment": "Lifestyle changes, oral hypoglycemic agents (metformin), insulin therapy if needed, regular monitoring.",
            "precautions": "Maintain healthy weight, regular exercise, balanced diet, regular blood sugar monitoring, foot care.",
            "home_remedies": "Cinnamon, fenugreek seeds, bitter gourd juice, aloe vera, regular walking, portion control.",
            "recovery_time": "Lifelong management condition",
            "diet_suggestions": "Low glycemic index foods, high fiber, lean proteins, healthy fats. Avoid sugar, refined carbs, processed foods.",
            "hydration_advice": "Drink plenty of water. Avoid sugary drinks and fruit juices. Limit alcohol. Stay hydrated to help control blood sugar.",
            "when_to_see_doctor": "Uncontrolled blood sugar levels, symptoms of complications (vision changes, foot ulcers, frequent infections).",
        },
        {
            "name": "Anemia",
            "description": "A condition where blood lacks enough healthy red blood cells to carry adequate oxygen to tissues.",
            "causes": "Iron deficiency, vitamin B12 deficiency, chronic diseases, genetic disorders (sickle cell), blood loss.",
            "treatment": "Iron supplements, vitamin B12 injections, folic acid supplements, treat underlying cause.",
            "precautions": "Iron-rich diet, regular health checkups, manage underlying conditions, blood loss prevention.",
            "home_remedies": "Iron-rich foods like spinach, lentils, red meat; vitamin C to enhance iron absorption; blackstrap molasses.",
            "recovery_time": "2-4 months with proper treatment",
            "diet_suggestions": "Iron-rich foods (spinach, red meat, beans, fortified cereals), vitamin C sources (citrus fruits), folate-rich foods.",
            "hydration_advice": "Drink adequate water. Avoid excessive tea or coffee with meals as tannins reduce iron absorption.",
            "when_to_see_doctor": "Persistent fatigue, shortness of breath, pale skin, rapid heartbeat, or cold hands and feet.",
        },
        {
            "name": "Urinary Tract Infection",
            "description": "Infection in any part of the urinary system, most commonly affecting the bladder and urethra.",
            "causes": "Bacterial infection (usually E. coli) entering the urinary tract, poor hygiene, dehydration, weakened immune system.",
            "treatment": "Antibiotics (nitrofurantoin, trimethoprim-sulfamethoxazole), pain relievers, increased fluid intake.",
            "precautions": "Drink plenty of water, urinate frequently, proper hygiene, wipe front to back, urinate after intercourse.",
            "home_remedies": "Cranberry juice, increased water intake, unsweetened yogurt, vitamin C, warm compress for pain.",
            "recovery_time": "3-7 days with antibiotics",
            "diet_suggestions": "Cranberries, blueberries, yogurt with probiotics, vitamin C rich foods. Avoid caffeine, alcohol, spicy foods.",
            "hydration_advice": "Drink 10-12 glasses of water daily to flush bacteria from urinary tract. Unsweetened cranberry juice is beneficial.",
            "when_to_see_doctor": "Blood in urine, back pain, fever and chills, nausea, or symptoms lasting more than 2 days.",
        },
        {
            "name": "Pneumonia",
            "description": "Infection that inflames air sacs in one or both lungs, causing cough with phlegm, fever, and difficulty breathing.",
            "causes": "Bacterial (Streptococcus pneumoniae), viral (influenza, RSV), or fungal infections of the lungs.",
            "treatment": "Antibiotics for bacterial, antivirals for viral, fever reducers, cough medicine, oxygen if needed.",
            "precautions": "Vaccination (pneumococcal, flu), hand hygiene, no smoking, strong immune system, avoid sick people.",
            "home_remedies": "Steam inhalation, warm compress on chest, honey and ginger tea, plenty of rest, humidifier.",
            "recovery_time": "1-3 weeks",
            "diet_suggestions": "Warm soups, protein-rich foods, fruits with vitamin C, garlic, ginger, turmeric milk, easy-to-digest foods.",
            "hydration_advice": "Drink 10-12 glasses of fluids daily. Warm water, herbal teas, and soups help loosen mucus and prevent dehydration.",
            "when_to_see_doctor": "Difficulty breathing, chest pain, persistent fever above 102°F, confusion, or bluish lips/nails.",
        },
        {
            "name": "Bronchitis",
            "description": "Inflammation of the bronchial tubes lining, causing persistent cough with mucus production.",
            "causes": "Usually viral infections, sometimes bacterial. Smoking, air pollution, dust, and chemical fumes can trigger it.",
            "treatment": "Rest, fluids, cough suppressants, bronchodilators for wheezing, antibiotics only if bacterial.",
            "precautions": "Avoid smoking, wear mask in polluted areas, hand hygiene, avoid respiratory irritants.",
            "home_remedies": "Steam inhalation, honey and lemon, ginger tea, salt water gargle, warm compress on chest.",
            "recovery_time": "2-3 weeks for acute, chronic may persist",
            "diet_suggestions": "Warm soups, ginger, turmeric, garlic, honey, vitamin C rich fruits. Avoid dairy if mucus increases.",
            "hydration_advice": "Drink 8-10 glasses of water daily to thin mucus. Herbal teas, broths, and warm lemon water are beneficial.",
            "when_to_see_doctor": "Fever above 100.4°F, bloody mucus, difficulty breathing, or symptoms lasting more than 3 weeks.",
        },
        {
            "name": "Allergic Rhinitis",
            "description": "An allergic reaction causing sneezing, congestion, and itchy eyes when exposed to allergens.",
            "causes": "Pollen, dust mites, pet dander, mold spores, and other airborne allergens triggering immune response.",
            "treatment": "Antihistamines, nasal corticosteroids, decongestants, immunotherapy for severe cases.",
            "precautions": "Avoid allergens, use air purifiers, keep windows closed during high pollen, regular cleaning.",
            "home_remedies": "Saline nasal rinse, steam inhalation, local honey, quercetin-rich foods, neti pot.",
            "recovery_time": "Varies - seasonal or perennial condition",
            "diet_suggestions": "Anti-inflammatory foods (turmeric, ginger), local honey, omega-3 fatty acids, foods rich in quercetin (onions, apples).",
            "hydration_advice": "Stay well hydrated. Warm fluids like herbal teas can help soothe irritated nasal passages.",
            "when_to_see_doctor": "Symptoms affecting quality of life, over-the-counter medications not working, severe sinus infections.",
        },
        {
            "name": "Arthritis",
            "description": "Inflammation of one or more joints causing pain, stiffness, and reduced range of motion.",
            "causes": "Autoimmune (rheumatoid), wear and tear (osteoarthritis), age, genetics, injury, obesity, infections.",
            "treatment": "Pain relievers, NSAIDs, disease-modifying antirheumatic drugs (DMARDs), physical therapy, joint replacement.",
            "precautions": "Low-impact exercise, maintain healthy weight, joint protection, proper posture, ergonomic adjustments.",
            "home_remedies": "Hot and cold therapy, gentle stretching, Epsom salt baths, turmeric, ginger tea, massage with essential oils.",
            "recovery_time": "Lifelong management condition",
            "diet_suggestions": "Anti-inflammatory diet - omega-3 fatty acids (fish, flaxseed), turmeric, ginger, berries, olive oil, leafy greens.",
            "hydration_advice": "Drink 8 glasses of water daily. Proper hydration helps maintain joint lubrication and reduces stiffness.",
            "when_to_see_doctor": "Severe joint pain, swelling limiting movement, joint deformity, or symptoms not responding to OTC medications.",
        },
        {
            "name": "Asthma",
            "description": "A chronic condition where airways narrow and swell, producing extra mucus, making breathing difficult.",
            "causes": "Genetics, respiratory infections, allergens (pollen, dust mites), exercise, cold air, smoke, stress.",
            "treatment": "Inhaled corticosteroids, bronchodilators, leukotriene modifiers, biologic therapies for severe cases.",
            "precautions": "Avoid triggers, use peak flow meter, follow action plan, keep rescue inhaler accessible, regular checkups.",
            "home_remedies": "Breathing exercises (pursed lip, diaphragmatic), steam therapy, ginger tea, mustard oil massage, coffee (caffeine as mild bronchodilator).",
            "recovery_time": "Lifelong management condition",
            "diet_suggestions": "Anti-inflammatory foods, vitamin D rich foods, magnesium-rich foods. Avoid sulfites and food triggers.",
            "hydration_advice": "Stay well hydrated - 8 glasses daily. Warm fluids help loosen mucus in airways. Avoid very cold drinks.",
            "when_to_see_doctor": "Frequent asthma attacks, rescue inhaler not working, peak flow readings dropping, difficulty speaking due to breathlessness.",
        },
        {
            "name": "Gastritis",
            "description": "Inflammation of the stomach lining causing upper abdominal pain, nausea, and feeling of fullness.",
            "causes": "H. pylori infection, NSAIDs overuse, excessive alcohol, stress, autoimmune conditions, bile reflux.",
            "treatment": "Antacids, proton pump inhibitors, H2 blockers, antibiotics for H. pylori, avoid trigger substances.",
            "precautions": "Avoid NSAIDs, limit alcohol, manage stress, eat small frequent meals, avoid spicy/acidic foods.",
            "home_remedies": "Ginger tea, chamomile tea, aloe vera juice, small frequent meals, probiotics (yogurt), licorice root.",
            "recovery_time": "2-10 days for acute, longer for chronic",
            "diet_suggestions": "Bland diet - bananas, rice, toast, applesauce, oatmeal, boiled vegetables. Avoid spicy, fatty, acidic, and fried foods.",
            "hydration_advice": "Drink water between meals rather than during. Herbal teas like chamomile and ginger soothe the stomach lining.",
            "when_to_see_doctor": "Blood in vomit or stool, severe abdominal pain, unintentional weight loss, persistent symptoms.",
        },
        {
            "name": "Food Poisoning",
            "description": "Illness caused by consuming contaminated food with bacteria, viruses, or toxins.",
            "causes": "Bacteria (Salmonella, E. coli, Listeria), viruses (norovirus), parasites, or toxins from improperly handled or cooked food.",
            "treatment": "Oral rehydration, rest, anti-diarrheal medications in some cases, antibiotics for bacterial infections.",
            "precautions": "Cook food thoroughly, wash hands and surfaces, refrigerate promptly, avoid cross-contamination.",
            "home_remedies": "Oral rehydration solution, ginger tea, activated charcoal (under guidance), rest digestive system with clear liquids.",
            "recovery_time": "1-5 days depending on severity",
            "diet_suggestions": "Clear liquids first, then BRAT diet (Bananas, Rice, Applesauce, Toast). Avoid dairy, fatty food, caffeine.",
            "hydration_advice": "Critical to replace lost fluids. Drink oral rehydration solution or clear liquids frequently. Seek medical help if unable to keep fluids down.",
            "when_to_see_doctor": "Blood in stool, high fever, severe dehydration, inability to keep fluids down for 24 hours, neurological symptoms.",
        },
        {
            "name": "Dengue Fever",
            "description": "A mosquito-borne viral infection causing high fever, severe headache, and joint pain.",
            "causes": "Dengue virus transmitted by Aedes mosquitoes, common in tropical and subtropical regions.",
            "treatment": "Supportive care, acetaminophen for fever (avoid NSAIDs due to bleeding risk), IV fluids if needed, platelet monitoring.",
            "precautions": "Mosquito prevention (nets, repellents, screens), eliminate standing water, wear protective clothing.",
            "home_remedies": "Papaya leaf juice (may help increase platelets), adequate rest, cold compresses, coconut water for hydration.",
            "recovery_time": "2-7 days for acute phase, up to 2 weeks for full recovery",
            "diet_suggestions": "Papaya leaf juice, pomegranate juice, coconut water, vegetable soups, vitamin K rich foods, easily digestible proteins.",
            "hydration_advice": "Drink plenty of fluids - water, oral rehydration solution, coconut water, fruit juices (without added sugar). Avoid caffeine and alcohol.",
            "when_to_see_doctor": "Severe abdominal pain, persistent vomiting, bleeding gums, difficulty breathing, cold extremities, restlessness.",
        },
    ]

    disease_objs = {}
    for disease_data in diseases_data:
        existing = db.query(Disease).filter(Disease.name == disease_data["name"]).first()
        if not existing:
            existing = Disease(**disease_data)
            db.add(existing)
            db.flush()
        disease_objs[disease_data["name"]] = existing
    db.commit()
    return disease_objs


def seed_medicines(db: Session):
    medicines_data = [
        {"name": "Paracetamol", "medicine_type": "Tablet", "dosage": "500-1000 mg every 4-6 hours", "age_group": "Adults and children above 12", "side_effects": "Liver damage with overdose, nausea, skin rash", "food_interaction": "Avoid alcohol", "usage_instructions": "Take with or after food. Do not exceed 4g daily."},
        {"name": "Ibuprofen", "medicine_type": "Tablet", "dosage": "200-400 mg every 6-8 hours", "age_group": "Adults and children above 6 months", "side_effects": "Stomach ulcers, heartburn, kidney issues, increased bleeding risk", "food_interaction": "Take with food to reduce stomach irritation", "usage_instructions": "Take with food or milk. Do not use for more than 10 days."},
        {"name": "Amoxicillin", "medicine_type": "Capsule", "dosage": "250-500 mg every 8 hours", "age_group": "Adults and children", "side_effects": "Diarrhea, nausea, skin rash, allergic reactions", "food_interaction": "Can be taken with or without food", "usage_instructions": "Complete full course even if symptoms improve. Take at evenly spaced intervals."},
        {"name": "Cetirizine", "medicine_type": "Tablet", "dosage": "10 mg once daily", "age_group": "Adults and children above 6", "side_effects": "Drowsiness, dry mouth, dizziness, headache", "food_interaction": "Avoid alcohol - may increase drowsiness", "usage_instructions": "Take in the evening if drowsiness occurs. May cause drowsiness."},
        {"name": "Ivermectin", "medicine_type": "Tablet", "dosage": "As prescribed by physician", "age_group": "Adults", "side_effects": "Dizziness, nausea, diarrhea, skin rash", "food_interaction": "Take on empty stomach with water", "usage_instructions": "Take exactly as prescribed. Do not exceed recommended dose."},
        {"name": "Azithromycin", "medicine_type": "Tablet", "dosage": "500 mg once daily for 3 days", "age_group": "Adults and children", "side_effects": "Nausea, diarrhea, abdominal pain, heart rhythm changes", "food_interaction": "Take 1 hour before or 2 hours after food", "usage_instructions": "Take at the same time each day. Complete full course."},
        {"name": "Doxycycline", "medicine_type": "Capsule", "dosage": "100 mg twice daily", "age_group": "Adults and children above 8", "side_effects": "Photosensitivity, nausea, tooth discoloration in children", "food_interaction": "Take with full glass of water. Avoid dairy within 2 hours.", "usage_instructions": "Stay upright for 30 minutes after taking. Use sun protection."},
        {"name": "Metformin", "medicine_type": "Tablet", "dosage": "500-2000 mg daily in divided doses", "age_group": "Adults", "side_effects": "Nausea, diarrhea, metallic taste, vitamin B12 deficiency", "food_interaction": "Take with meals to reduce GI side effects", "usage_instructions": "Start with low dose and gradually increase. Monitor kidney function."},
        {"name": "Omeprazole", "medicine_type": "Capsule", "dosage": "20-40 mg once daily", "age_group": "Adults", "side_effects": "Headache, nausea, vitamin B12 deficiency, increased infection risk", "food_interaction": "Take before first meal of the day", "usage_instructions": "Swallow whole - do not crush or chew. Take 30-60 minutes before meals."},
        {"name": "Loperamide", "medicine_type": "Capsule", "dosage": "2-4 mg after each loose stool, max 16 mg daily", "age_group": "Adults and children above 12", "side_effects": "Dizziness, drowsiness, constipation, dry mouth", "food_interaction": "Avoid alcohol", "usage_instructions": "Take after each loose stool. Do not use for more than 2 days."},
        {"name": "Oseltamivir", "medicine_type": "Capsule", "dosage": "75 mg twice daily for 5 days", "age_group": "Adults and children above 1 year", "side_effects": "Nausea, vomiting, headache, neuropsychiatric effects (rare)", "food_interaction": "Take with food to reduce nausea", "usage_instructions": "Start within 48 hours of symptom onset for best effectiveness."},
        {"name": "Prednisolone", "medicine_type": "Tablet", "dosage": "5-60 mg daily as prescribed", "age_group": "Adults and children", "side_effects": "Weight gain, osteoporosis, high blood sugar, immunosuppression", "food_interaction": "Take with food to protect stomach", "usage_instructions": "Do not stop suddenly - taper dose as directed. Long-term use requires monitoring."},
        {"name": "Salbutamol Inhaler", "medicine_type": "Inhaler", "dosage": "1-2 puffs as needed for relief", "age_group": "All ages", "side_effects": "Increased heart rate, tremor, headache, muscle cramps", "food_interaction": "No significant interactions", "usage_instructions": "Shake well before use. Use spacer for better delivery. Rinse mouth after use."},
        {"name": "Amoxicillin-Clavulanate", "medicine_type": "Tablet", "dosage": "625 mg every 12 hours", "age_group": "Adults and children", "side_effects": "Diarrhea, rash, nausea, yeast infections", "food_interaction": "Take with food to reduce stomach upset", "usage_instructions": "Complete full course. Take with food at evenly spaced intervals."},
        {"name": "Nitrofurantoin", "medicine_type": "Capsule", "dosage": "100 mg twice daily", "age_group": "Adults", "side_effects": "Nausea, headache, lung reactions (rare), brown urine", "food_interaction": "Take with food to improve absorption and reduce nausea", "usage_instructions": "Complete full course. May cause brown discoloration of urine - harmless."},
        {"name": "Losartan", "medicine_type": "Tablet", "dosage": "25-100 mg once daily", "age_group": "Adults", "side_effects": "Dizziness, low blood pressure, kidney function changes, high potassium", "food_interaction": "Avoid potassium supplements and salt substitutes", "usage_instructions": "Take at same time daily. Monitor blood pressure regularly."},
        {"name": "Amlodipine", "medicine_type": "Tablet", "dosage": "5-10 mg once daily", "age_group": "Adults", "side_effects": "Ankle swelling, dizziness, flushing, palpitations, fatigue", "food_interaction": "Avoid grapefruit juice", "usage_instructions": "Take at same time daily. Can be taken with or without food."},
        {"name": "Metoprolol", "medicine_type": "Tablet", "dosage": "25-100 mg once or twice daily", "age_group": "Adults", "side_effects": "Fatigue, dizziness, slow heart rate, cold extremities", "food_interaction": "Take with food or immediately after meals", "usage_instructions": "Do not stop abruptly. Monitor heart rate regularly."},
        {"name": "Hydrochlorothiazide", "medicine_type": "Tablet", "dosage": "12.5-50 mg once daily", "age_group": "Adults", "side_effects": "Frequent urination, electrolyte imbalance, dizziness, photosensitivity", "food_interaction": "Take in morning to avoid nighttime urination", "usage_instructions": "Take early in the day. Monitor potassium levels."},
        {"name": "Atorvastatin", "medicine_type": "Tablet", "dosage": "10-80 mg once daily", "age_group": "Adults", "side_effects": "Muscle pain, liver enzyme elevation, digestive issues", "food_interaction": "Avoid grapefruit juice", "usage_instructions": "Take at same time daily. Report unexplained muscle pain."},
        {"name": "Ferrous Sulfate", "medicine_type": "Tablet", "dosage": "200-300 mg 2-3 times daily", "age_group": "Adults", "side_effects": "Constipation, dark stools, nausea, stomach cramps", "food_interaction": "Vitamin C enhances absorption. Avoid tea/coffee with meals.", "usage_instructions": "Take on empty stomach for best absorption. Can take with food if GI upset occurs."},
        {"name": "Vitamin B12", "medicine_type": "Injection/Tablet", "dosage": "1000 mcg daily oral or monthly injection", "age_group": "Adults", "side_effects": "Rare side effects - mild diarrhea, itching", "food_interaction": "No significant interactions", "usage_instructions": "Sublingual tablets preferred for better absorption. Injections for deficiency."},
        {"name": "Folic Acid", "medicine_type": "Tablet", "dosage": "1-5 mg daily", "age_group": "Adults and children", "side_effects": "Rare - bitter taste, nausea, sleep disturbances", "food_interaction": "No significant interactions", "usage_instructions": "Take at same time daily. Important before and during pregnancy."},
        {"name": "Sumatriptan", "medicine_type": "Tablet/Injection", "dosage": "50-100 mg at onset of migraine", "age_group": "Adults", "side_effects": "Tingling, dizziness, chest pressure, flushing, injection site reaction", "food_interaction": "Avoid MAO inhibitors", "usage_instructions": "Take at first sign of migraine. Do not exceed 200 mg in 24 hours."},
        {"name": "Diclofenac", "medicine_type": "Gel/Tablet", "dosage": "50 mg 2-3 times daily or gel applied topically", "age_group": "Adults", "side_effects": "Stomach ulcers, increased bleeding risk, kidney issues (oral)", "food_interaction": "Take with food if oral form", "usage_instructions": "Topical gel for localized pain. Oral form short-term use only."},
        {"name": "Cetrizine-D", "medicine_type": "Tablet", "dosage": "1 tablet twice daily", "age_group": "Adults", "side_effects": "Drowsiness, dry mouth, insomnia (from decongestant), increased heart rate", "food_interaction": "Avoid alcohol. Avoid caffeine as it may increase side effects.", "usage_instructions": "Do not take within 4 hours of bedtime to avoid insomnia."},
        {"name": "Albuterol", "medicine_type": "Inhaler", "dosage": "1-2 puffs every 4-6 hours as needed", "age_group": "All ages", "side_effects": "Increased heart rate, jitteriness, headache, throat irritation", "food_interaction": "No significant interactions", "usage_instructions": "Shake well before each use. Rinse mouth after use to prevent thrush."},
        {"name": "Naproxen", "medicine_type": "Tablet", "dosage": "250-500 mg twice daily", "age_group": "Adults", "side_effects": "Stomach ulcers, heartburn, kidney issues, increased bleeding risk", "food_interaction": "Take with food to reduce stomach upset", "usage_instructions": "Take with food or milk. Use lowest effective dose for shortest duration."},
        {"name": "Levofloxacin", "medicine_type": "Tablet", "dosage": "500 mg once daily", "age_group": "Adults", "side_effects": "Tendonitis, nerve damage, GI upset, photosensitivity", "food_interaction": "Avoid dairy products within 2 hours", "usage_instructions": "Drink plenty of fluids. Avoid excessive sun exposure."},
        {"name": "Fluconazole", "medicine_type": "Capsule", "dosage": "150-400 mg once daily", "age_group": "Adults", "side_effects": "Headache, nausea, abdominal pain, liver enzyme elevation", "food_interaction": "Can be taken with or without food", "usage_instructions": "Complete full course. Monitor liver function with prolonged use."},
        {"name": "Acetaminophen with Codeine", "medicine_type": "Tablet", "dosage": "1-2 tablets every 4-6 hours as needed", "age_group": "Adults", "side_effects": "Drowsiness, constipation, nausea, risk of dependence", "food_interaction": "Avoid alcohol", "usage_instructions": "Take with food. Do not exceed recommended dose due to acetaminophen content."},
        {"name": "Budesonide Inhaler", "medicine_type": "Inhaler", "dosage": "1-2 puffs twice daily", "age_group": "Adults and children", "side_effects": "Throat irritation, oral thrush, hoarseness, cough", "food_interaction": "No significant interactions", "usage_instructions": "Use regularly for asthma control. Rinse mouth after each use. Not for acute attacks."},
        {"name": "Montelukast", "medicine_type": "Tablet", "dosage": "10 mg once daily in evening", "age_group": "Adults and children above 6", "side_effects": "Headache, abdominal pain, behavioral changes (rare), cough", "food_interaction": "Can be taken with or without food", "usage_instructions": "Take in the evening. Not for acute asthma attacks. Monitor for behavioral changes."},
        {"name": "Zinc Supplements", "medicine_type": "Tablet", "dosage": "10-30 mg daily", "age_group": "Adults and children", "side_effects": "Nausea, metallic taste, copper deficiency with long-term high dose", "food_interaction": "Avoid with calcium/iron supplements", "usage_instructions": "Take with food to reduce nausea. Do not exceed recommended dose."},
        {"name": "Vitamin C", "medicine_type": "Tablet", "dosage": "500-1000 mg daily", "age_group": "All ages", "side_effects": "Diarrhea, stomach cramps with high doses, kidney stones (rare)", "food_interaction": "Enhances iron absorption", "usage_instructions": "Can be taken with or without food. High doses may cause GI upset."},
        {"name": "Oral Rehydration Solution", "medicine_type": "Powder for solution", "dosage": "As needed for dehydration", "age_group": "All ages", "side_effects": "Rare - nausea if consumed too quickly", "food_interaction": "No significant interactions", "usage_instructions": "Mix with clean water as directed. Sip slowly and frequently."},
        {"name": "Antacids", "medicine_type": "Tablet/Suspension", "dosage": "As directed for acid relief", "age_group": "Adults", "side_effects": "Constipation or diarrhea, gas", "food_interaction": "Take 1 hour after meals", "usage_instructions": "Chew or take as directed. Do not take within 2 hours of other medications."},
    ]

    medicine_objs = {}
    for med_data in medicines_data:
        existing = db.query(Medicine).filter(Medicine.name == med_data["name"]).first()
        if not existing:
            existing = Medicine(**med_data)
            db.add(existing)
            db.flush()
        medicine_objs[med_data["name"]] = existing
    db.commit()
    return medicine_objs


def seed_relationships(db: Session, disease_objs: dict, medicine_objs: dict):
    disease_symptom_map = {
        "Common Cold": ["Fever", "Cough", "Headache", "Fatigue", "Sore Throat", "Runny Nose", "Sneezing"],
        "Influenza": ["Fever", "Cough", "Headache", "Fatigue", "Body Ache", "Sore Throat", "Loss of Appetite"],
        "COVID-19": ["Fever", "Cough", "Fatigue", "Shortness of Breath", "Loss of Appetite", "Headache", "Sore Throat"],
        "Migraine": ["Headache", "Nausea", "Vomiting", "Blurred Vision", "Dizziness"],
        "Tension Headache": ["Headache", "Fatigue", "Anxiety", "Neck Pain"],
        "Gastroenteritis": ["Nausea", "Vomiting", "Diarrhea", "Abdominal Pain", "Fever", "Fatigue", "Loss of Appetite"],
        "Hypertension": ["Headache", "Dizziness", "Blurred Vision", "Nausea", "Palpitations"],
        "Diabetes Type 2": ["Fatigue", "Frequent Urination", "Excessive Thirst", "Weight Loss", "Blurred Vision"],
        "Anemia": ["Fatigue", "Dizziness", "Headache", "Shortness of Breath", "Pale Skin"],
        "Urinary Tract Infection": ["Frequent Urination", "Abdominal Pain", "Fever", "Nausea"],
        "Pneumonia": ["Cough", "Fever", "Shortness of Breath", "Fatigue", "Chest Pain", "Loss of Appetite"],
        "Bronchitis": ["Cough", "Fatigue", "Shortness of Breath", "Fever", "Chest Pain", "Body Ache"],
        "Allergic Rhinitis": ["Sneezing", "Runny Nose", "Cough", "Headache", "Fatigue"],
        "Arthritis": ["Joint Pain", "Fatigue", "Swelling", "Body Ache"],
        "Asthma": ["Shortness of Breath", "Cough", "Chest Pain", "Fatigue", "Anxiety"],
        "Gastritis": ["Abdominal Pain", "Nausea", "Vomiting", "Indigestion", "Loss of Appetite"],
        "Food Poisoning": ["Nausea", "Vomiting", "Diarrhea", "Abdominal Pain", "Fever", "Fatigue"],
        "Dengue Fever": ["Fever", "Headache", "Body Ache", "Joint Pain", "Nausea", "Vomiting", "Skin Rash"],
    }

    disease_medicine_map = {
        "Common Cold": ["Paracetamol", "Cetirizine", "Vitamin C", "Zinc Supplements"],
        "Influenza": ["Oseltamivir", "Paracetamol", "Ibuprofen", "Vitamin C", "Zinc Supplements"],
        "COVID-19": ["Paracetamol", "Ivermectin", "Vitamin C", "Zinc Supplements"],
        "Migraine": ["Sumatriptan", "Ibuprofen", "Paracetamol"],
        "Tension Headache": ["Ibuprofen", "Paracetamol", "Naproxen"],
        "Gastroenteritis": ["Oral Rehydration Solution", "Loperamide", "Paracetamol", "Zinc Supplements"],
        "Hypertension": ["Losartan", "Amlodipine", "Metoprolol", "Hydrochlorothiazide"],
        "Diabetes Type 2": ["Metformin"],
        "Anemia": ["Ferrous Sulfate", "Vitamin B12", "Folic Acid", "Vitamin C"],
        "Urinary Tract Infection": ["Nitrofurantoin", "Amoxicillin", "Levofloxacin"],
        "Pneumonia": ["Amoxicillin-Clavulanate", "Azithromycin", "Levofloxacin", "Paracetamol"],
        "Bronchitis": ["Amoxicillin-Clavulanate", "Azithromycin", "Ibuprofen", "Salbutamol Inhaler"],
        "Allergic Rhinitis": ["Cetirizine", "Cetrizine-D", "Budesonide Inhaler"],
        "Arthritis": ["Naproxen", "Ibuprofen", "Diclofenac", "Prednisolone"],
        "Asthma": ["Salbutamol Inhaler", "Budesonide Inhaler", "Montelukast", "Prednisolone"],
        "Gastritis": ["Omeprazole", "Antacids"],
        "Food Poisoning": ["Oral Rehydration Solution", "Loperamide", "Paracetamol"],
        "Dengue Fever": ["Paracetamol", "Oral Rehydration Solution", "Vitamin C", "Zinc Supplements"],
    }

    symptom_map = {s.name: s for s in db.query(Symptom).all()}

    for disease_name, symptom_names in disease_symptom_map.items():
        if disease_name in disease_objs:
            disease = disease_objs[disease_name]
            for sym_name in symptom_names:
                if sym_name in symptom_map:
                    if symptom_map[sym_name] not in disease.symptoms:
                        disease.symptoms.append(symptom_map[sym_name])

    for disease_name, medicine_names in disease_medicine_map.items():
        if disease_name in disease_objs:
            disease = disease_objs[disease_name]
            for med_name in medicine_names:
                if med_name in medicine_objs:
                    if medicine_objs[med_name] not in disease.medicines:
                        disease.medicines.append(medicine_objs[med_name])

    db.commit()


def seed_doctors(db: Session):
    doctor_data = [
        {
            "username": "dr.smith",
            "email": "smith@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. John Smith",
            "specialty": "General Medicine",
            "license_number": "LIC-1001",
            "experience_years": 15,
            "qualification": "MD Internal Medicine",
            "hospital_name": "City General Hospital",
            "available_days": "Mon,Tue,Wed,Thu,Fri",
            "available_time_start": "09:00",
            "available_time_end": "17:00",
            "consultation_fee": 1500,
            "bio": "Experienced general physician with 15 years in clinical practice. Specializes in comprehensive primary care and preventive medicine.",
        },
        {
            "username": "dr.jones",
            "email": "jones@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. Sarah Jones",
            "specialty": "Cardiology",
            "license_number": "LIC-1002",
            "experience_years": 20,
            "qualification": "MD Cardiology, DM Cardiology",
            "hospital_name": "Heart Care Center",
            "available_days": "Mon,Tue,Wed,Thu",
            "available_time_start": "10:00",
            "available_time_end": "16:00",
            "consultation_fee": 2500,
            "bio": "Senior cardiologist specializing in heart disease management, hypertension, and preventive cardiac care.",
        },
        {
            "username": "dr.patel",
            "email": "patel@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. Raj Patel",
            "specialty": "Pulmonology",
            "license_number": "LIC-1003",
            "experience_years": 12,
            "qualification": "MD Pulmonology",
            "hospital_name": "City General Hospital",
            "available_days": "Mon,Wed,Fri",
            "available_time_start": "09:00",
            "available_time_end": "15:00",
            "consultation_fee": 2000,
            "bio": "Pulmonologist with expertise in asthma, COPD, respiratory infections, and sleep disorders.",
        },
        {
            "username": "dr.wilson",
            "email": "wilson@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. Emily Wilson",
            "specialty": "Neurology",
            "license_number": "LIC-1004",
            "experience_years": 18,
            "qualification": "MD Neurology, DM Neurology",
            "hospital_name": "Neuro Institute",
            "available_days": "Tue,Thu,Sat",
            "available_time_start": "10:00",
            "available_time_end": "18:00",
            "consultation_fee": 3000,
            "bio": "Neurologist specializing in migraine management, stroke treatment, and neurological disorders.",
        },
        {
            "username": "dr.garcia",
            "email": "garcia@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. Maria Garcia",
            "specialty": "Gastroenterology",
            "license_number": "LIC-1005",
            "experience_years": 14,
            "qualification": "MD Gastroenterology",
            "hospital_name": "Digestive Health Clinic",
            "available_days": "Mon,Tue,Wed,Thu,Fri",
            "available_time_start": "08:00",
            "available_time_end": "14:00",
            "consultation_fee": 2200,
            "bio": "Gastroenterologist specializing in digestive disorders, liver disease, and nutritional management.",
        },
        {
            "username": "dr.chen",
            "email": "chen@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. David Chen",
            "specialty": "Orthopedics",
            "license_number": "LIC-1006",
            "experience_years": 16,
            "qualification": "MS Orthopedics",
            "hospital_name": "Bone & Joint Center",
            "available_days": "Mon,Tue,Wed,Thu,Fri",
            "available_time_start": "09:00",
            "available_time_end": "17:00",
            "consultation_fee": 2500,
            "bio": "Orthopedic surgeon with expertise in arthritis management, joint replacement, and sports injuries.",
        },
        {
            "username": "dr.thompson",
            "email": "thompson@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. Lisa Thompson",
            "specialty": "Pediatrics",
            "license_number": "LIC-1007",
            "experience_years": 10,
            "qualification": "MD Pediatrics",
            "hospital_name": "Children's Health Hospital",
            "available_days": "Mon,Tue,Wed,Thu,Fri,Sat",
            "available_time_start": "10:00",
            "available_time_end": "16:00",
            "consultation_fee": 1800,
            "bio": "Pediatrician dedicated to children's health, developmental monitoring, and childhood disease management.",
        },
        {
            "username": "dr.kumar",
            "email": "kumar@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. Anika Kumar",
            "specialty": "Gynecology",
            "license_number": "LIC-1008",
            "experience_years": 13,
            "qualification": "MD Gynecology",
            "hospital_name": "Women's Wellness Center",
            "available_days": "Mon,Wed,Fri",
            "available_time_start": "09:00",
            "available_time_end": "17:00",
            "consultation_fee": 2300,
            "bio": "Gynecologist with focus on women's health, family planning, and preventive care.",
        },
        {
            "username": "dr.brown",
            "email": "brown@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. Robert Brown",
            "specialty": "Dermatology",
            "license_number": "LIC-1009",
            "experience_years": 11,
            "qualification": "MD Dermatology",
            "hospital_name": "Skin Care Clinic",
            "available_days": "Tue,Thu,Sat",
            "available_time_start": "10:00",
            "available_time_end": "16:00",
            "consultation_fee": 2000,
            "bio": "Dermatologist treating skin conditions, allergies, and cosmetic dermatology.",
        },
        {
            "username": "dr.lee",
            "email": "lee@hospital.com",
            "password": "doctor123",
            "full_name": "Dr. Michelle Lee",
            "specialty": "Endocrinology",
            "license_number": "LIC-1010",
            "experience_years": 14,
            "qualification": "MD Endocrinology",
            "hospital_name": "Metabolic Health Center",
            "available_days": "Mon,Tue,Wed,Thu,Fri",
            "available_time_start": "08:00",
            "available_time_end": "15:00",
            "consultation_fee": 2400,
            "bio": "Endocrinologist specializing in diabetes management, thyroid disorders, and metabolic health.",
        },
    ]

    for doc_data in doctor_data:
        user_data = {
            "username": doc_data["username"],
            "email": doc_data["email"],
            "hashed_password": hash_password(doc_data["password"]),
            "full_name": doc_data["full_name"],
            "role": UserRole.doctor,
        }
        existing_user = db.query(User).filter(
            (User.username == doc_data["username"]) | (User.email == doc_data["email"])
        ).first()
        if not existing_user:
            user = User(**user_data)
            db.add(user)
            db.flush()
            profile = DoctorProfile(
                user_id=user.id,
                specialty=doc_data["specialty"],
                license_number=doc_data["license_number"],
                experience_years=doc_data["experience_years"],
                qualification=doc_data["qualification"],
                hospital_name=doc_data["hospital_name"],
                available_days=doc_data["available_days"],
                available_time_start=doc_data["available_time_start"],
                available_time_end=doc_data["available_time_end"],
                consultation_fee=doc_data["consultation_fee"],
                is_verified=True,
                bio=doc_data["bio"],
                rating=4.5,
            )
            db.add(profile)

    db.commit()


def run_seed():
    db = SessionLocal()
    try:
        seed_symptoms(db)
        disease_objs = seed_diseases(db)
        medicine_objs = seed_medicines(db)
        seed_relationships(db, disease_objs, medicine_objs)
        seed_doctors(db)
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
