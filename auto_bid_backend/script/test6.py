from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

def find_similar_sentence(target_sentence, sentence_list, score_threshold):
    # Load pre-trained model
    model = SentenceTransformer('bert-base-nli-mean-tokens')

    # Generate embeddings for the target sentence and the sentences in the list
    target_embedding = model.encode([target_sentence])
    sentence_embeddings = model.encode(sentence_list)

    # Calculate cosine similarity between the target embedding and the sentence embeddings
    similarities = cosine_similarity(target_embedding, sentence_embeddings)[0]

     # Check if all similarities are below the threshold
    if all(similarity < score_threshold for similarity in similarities):
        return None

    # Find the index of the most similar sentence with a score above the threshold
    max_score_index = max(range(len(similarities)), key=lambda i: similarities[i] if similarities[i] >= score_threshold else -1)

    # Retrieve the most similar sentence
    similar_sentence = sentence_list[max_score_index]

    return similar_sentence

# Example usage
# target_sentence = "I like to go hiking in the mountains."
# sentence_list = [
#     "I enjoy hiking in the mountains.",
#     "Mountains are a great place for hiking.",
#     "I hate going to the mountains.",
#     "I prefer hiking in the forests.",
#     "I like to go skiing in the mountains."
# ]

target_sentence = "What interests you about working in this company?"
    # "First Name",
    # "Are you authorized to work in the US?",
    # "What is your employment status?",
    # "Do you have legal working rights in the United States?",
    # "Are you currently employed?"


# List of input questions
sentence_list = [
    "Do you have a work permit for the USA?",
    "What is your job status?",
    "Are you permitted to work in America?",
    "What is your First Name?",
    "Why do you want to work at this company?"
]

score_threshold = 0.85  # Set the score threshold for determining same meaning

similar_sentences = find_similar_sentence(target_sentence, sentence_list, score_threshold)
print(similar_sentences)
