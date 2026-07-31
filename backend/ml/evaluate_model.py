import os
import warnings
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.tree import DecisionTreeClassifier

from symptom_data import DISEASE_NAMES, SYMPTOMS, generate_dataset

warnings.filterwarnings("ignore")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "trained_model")


def load_model_and_data() -> tuple:
    model_path = os.path.join(MODEL_DIR, "symptom_classifier.pkl")
    encoder_path = os.path.join(MODEL_DIR, "label_encoder.pkl")
    symptoms_path = os.path.join(MODEL_DIR, "symptom_list.pkl")

    if not all(os.path.exists(p) for p in [model_path, encoder_path, symptoms_path]):
        print("Trained model files not found. Run train_model.py first.")
        raise FileNotFoundError("Model files missing. Run train_model.py first.")

    model = joblib.load(model_path)
    le = joblib.load(encoder_path)
    symptom_list = joblib.load(symptoms_path)

    df = generate_dataset(seed=42)
    X = df[symptom_list].values
    y_true = le.transform(df["disease"].values)

    return model, le, X, y_true, df


def print_detailed_classification_report(
    y_true: np.ndarray, y_pred: np.ndarray, le
) -> None:
    print("=" * 75)
    print("DETAILED CLASSIFICATION REPORT")
    print("=" * 75)
    print(classification_report(y_true, y_pred, target_names=le.classes_, digits=4))


def print_per_class_metrics(
    y_true: np.ndarray, y_pred: np.ndarray, le
) -> None:
    from sklearn.metrics import precision_recall_fscore_support

    report = precision_recall_fscore_support(y_true, y_pred)
    precisions, recalls, f1_scores, supports = report

    print("\n" + "=" * 75)
    print("PER-CLASS METRICS")
    print("=" * 75)
    print(f"{'Disease':<22} {'Precision':<10} {'Recall':<10} {'F1-Score':<10} {'Support':<8}")
    print("-" * 60)
    for i, cls in enumerate(le.classes_):
        print(
            f"{cls:<22} {precisions[i]:<10.4f} {recalls[i]:<10.4f} "
            f"{f1_scores[i]:<10.4f} {supports[i]:<8}"
        )


def print_confusion_matrix_text(y_true: np.ndarray, y_pred: np.ndarray, le) -> None:
    cm = confusion_matrix(y_true, y_pred)
    classes = le.classes_
    n = len(classes)

    print("\n" + "=" * 75)
    print("CONFUSION MATRIX (abbreviated)")
    print("=" * 75)
    display_n = min(12, n)
    header = f"{'':>22}" + "".join(f"{c[:7]:>7}" for c in classes[:display_n])
    print(header)
    print("-" * (22 + 8 * display_n))
    for i in range(display_n):
        row = f"{classes[i][:20]:>20}" + "".join(
            f"{cm[i, j]:>7}" for j in range(display_n)
        )
        print(row)

    if n > display_n:
        print(f"... ({n - display_n} additional classes)")

    correct = np.trace(cm)
    total = np.sum(cm)
    print(f"\nCorrect predictions: {correct}/{total} ({correct / total * 100:.2f}%)")
    print(f"Misclassifications: {total - correct}/{total} ({(total - correct) / total * 100:.2f}%)")


def show_feature_importance(model, symptom_list: list, top_n: int = 15) -> None:
    if isinstance(model, (DecisionTreeClassifier, RandomForestClassifier)):
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            indices = np.argsort(importances)[::-1]

            print("\n" + "=" * 75)
            print(f"TOP {top_n} FEATURE IMPORTANCES")
            print("=" * 75)
            print(f"{'Rank':<6} {'Symptom':<25} {'Importance':<12}")
            print("-" * 43)
            for i in range(min(top_n, len(symptom_list))):
                idx = indices[i]
                print(f"{i + 1:<6} {symptom_list[idx]:<25} {importances[idx]:<12.6f}")
    else:
        print(
            f"\nModel type {type(model).__name__} does not provide feature_importances_."
        )


def main() -> None:
    try:
        model, le, X, y_true, df = load_model_and_data()
    except FileNotFoundError as e:
        print(e)
        return

    y_pred = model.predict(X)

    print_detailed_classification_report(y_true, y_pred, le)
    print_per_class_metrics(y_true, y_pred, le)
    print_confusion_matrix_text(y_true, y_pred, le)
    show_feature_importance(model, SYMPTOMS)

    print("\n" + "=" * 75)
    print("EVALUATION COMPLETE")
    print("=" * 75)


if __name__ == "__main__":
    main()
