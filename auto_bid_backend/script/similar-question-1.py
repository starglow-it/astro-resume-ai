import torch
from transformers import BertTokenizer, BertModel
from scipy.spatial.distance import cosine
import numpy as np

# Load the model and tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased', return_dict=True)

def encode_questions(questions):
    """Encodes a list of questions into vectors."""
    model.eval()
    vectors = []
    for question in questions:
        with torch.no_grad():
            inputs = tokenizer(question, return_tensors='pt', padding=True, truncation=True, max_length=128)
            outputs = model(**inputs)
            vector = outputs.last_hidden_state[:, 0, :].squeeze()  # Use the CLS token's output
            vectors.append(vector.numpy())  # Convert to NumPy array for easier handling later
    return np.array(vectors)

def find_most_similar(new_question, questions, vectors):
    """Finds the most similar question in the list to the new question."""
    new_vector = encode_questions([new_question])[0]
    similarities = [1 - cosine(new_vector, vec) for vec in vectors]
    best_index = np.argmax(similarities)
    return questions[best_index], similarities[best_index]

# List of origin questions
origin_questions = [
    # "First Name",
    "Are you authorized to work in the US?",
    "What is your employment status?",
    "Do you have legal working rights in the United States?",
    # "Are you currently employed?"
]

# Pre-compute vectors for the origin questions
origin_vectors = encode_questions(origin_questions)

# List of input questions
input_questions = [
    "Do you have a work permit for the USA?",
    "What is your job status?",
    "Are you permitted to work in America?",
    "What is your First Name?",
]

# Find the most similar question for each input
for input_question in input_questions:
    most_similar_question, similarity_score = find_most_similar(input_question, origin_questions, origin_vectors)
    print(f"Input: '{input_question}' -> Best Match: '{most_similar_question}' (Score: {similarity_score:.2f})")
