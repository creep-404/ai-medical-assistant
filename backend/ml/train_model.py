import os
import warnings
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier

from symptom_data import DISEASE_NAMES, SYMPTOMS, generate_dataset

warnings.filterwarnings("ignore")

MODELS = {
    "DecisionTree": DecisionTreeClassifier(random_state=42, max_depth=15),
    "RandomForest": RandomForestClassifier(
        n_estimators=200, random_state=42, max_depth=20, n_jobs=-1
    ),
    "NaiveBayes": GaussianNB(),
    "LogisticRegression": LogisticRegression(
        random_state=42, max_iter=2000, multi_class="multinomial", C=1.0
    ),
}

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "trained_model")


def load_and_prepare_data(
    test_size: float = 0.2, random_state: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, LabelEncoder]:
    df = generate_dataset(seed=42)
    X = df[SYMPTOMS].values
    y = df["disease"].values

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=test_size, random_state=random_state, stratify=y_encoded
    )

    return X_train, X_test, y_train, y_test, le


def train_and_evaluate(
    X_train: np.ndarray,
    X_test: np.ndarray,
    y_train: np.ndarray,
    y_test: np.ndarray,
    le: LabelEncoder,
) -> Tuple[str, object]:
    results = []

    for name, model in MODELS.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

        results.append(
            {
                "Model": name,
                "Accuracy": acc,
                "Precision": prec,
                "Recall": rec,
                "F1-Score": f1,
            }
        )

        if name == "RandomForest":
            _print_confusion_matrix(y_test, y_pred, le, name)

    results_df = pd.DataFrame(results).sort_values("Accuracy", ascending=False)
    print("\n" + "=" * 70)
    print("MODEL COMPARISON TABLE")
    print("=" * 70)
    print(results_df.to_string(index=False))
    print("=" * 70)

    best_model_name = results_df.iloc[0]["Model"]
    best_model = MODELS[best_model_name]
    print(f"\nBest model: {best_model_name} (Accuracy: {results_df.iloc[0]['Accuracy']:.4f})")
    return best_model_name, best_model


def _print_confusion_matrix(
    y_test: np.ndarray, y_pred: np.ndarray, le: LabelEncoder, model_name: str
) -> None:
    cm = confusion_matrix(y_test, y_pred)
    classes = le.classes_
    print(f"\nConfusion Matrix for {model_name}:")
    header = f"{'':>20}" + "".join(f"{c[:8]:>8}" for c in classes[:10])
    print(header)
    for i, cls in enumerate(classes[:10]):
        row = f"{cls[:18]:>18}" + "".join(f"{cm[i, j]:>8}" for j in range(min(10, len(classes))))
        print(row)
    if len(classes) > 10:
        print(f"  ... ({len(classes) - 10} more classes not shown)")
    print()


def save_model(
    model: object,
    label_encoder: LabelEncoder,
    model_dir: str = MODEL_DIR,
) -> None:
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "symptom_classifier.pkl")
    encoder_path = os.path.join(model_dir, "label_encoder.pkl")
    symptoms_path = os.path.join(model_dir, "symptom_list.pkl")

    joblib.dump(model, model_path)
    joblib.dump(label_encoder, encoder_path)
    joblib.dump(SYMPTOMS, symptoms_path)

    print(f"\nSaved model to: {model_path}")
    print(f"Saved label encoder to: {encoder_path}")
    print(f"Saved symptom list to: {symptoms_path}")


def main() -> None:
    print("Loading and preparing data...")
    X_train, X_test, y_train, y_test, le = load_and_prepare_data()

    print(f"Training samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")
    print(f"Number of classes: {len(le.classes_)}")
    print(f"Features: {X_train.shape[1]}")

    print("\nTraining and evaluating models...")
    best_name, best_model = train_and_evaluate(X_train, X_test, y_train, y_test, le)

    best_model.fit(X_train, y_train)
    save_model(best_model, le)
    print("\nTraining pipeline complete!")


if __name__ == "__main__":
    main()
