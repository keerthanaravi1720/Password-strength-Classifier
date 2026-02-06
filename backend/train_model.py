import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib


print("Loading dataset...")
try:
    
    df = pd.read_csv('passwords.csv', on_bad_lines='skip') 
except FileNotFoundError:
    print("Error: 'passwords.csv' not found in the backend folder.")
    exit()

if len(df) > 50000:
    print(f"Dataset is large ({len(df)} rows). Sampling 50,000 for faster training...")
    df = df.sample(n=50000, random_state=42) 
else:
    print(f"Dataset size is manageable ({len(df)} rows). Using all data.")

df = df.dropna()


if 'password' not in df.columns or 'strength' not in df.columns:
    print("Error: CSV must contain 'password' and 'strength' columns.")
    exit()

X = df['password']
y = df['strength']


print("Vectorizing data...")
vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(3, 3)) 
X = vectorizer.fit_transform(X)


print("Training model... (This should be fast now)")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=50, random_state=42) # Reduced estimators to 50 for speed
model.fit(X_train, y_train)

print(f"Model Accuracy: {model.score(X_test, y_test)}")


joblib.dump(model, 'password_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')
print("Model and vectorizer saved successfully!")