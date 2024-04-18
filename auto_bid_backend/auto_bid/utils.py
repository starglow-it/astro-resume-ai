from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

def find_similar_sentence(target_sentence, sentence_list, score_threshold):
    # Load pre-trained model
    model = SentenceTransformer('bert-base-nli-mean-tokens')

    # Check it sentence_list is not empty
    if len(sentence_list) == 0:
        return None

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