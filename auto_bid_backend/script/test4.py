import tensorflow as tf
import tensorflow_hub as hub

def find_same_meaning_sentence(target_sentence, sentence_list, similarity_threshold):
    # Load the Universal Sentence Encoder model
    embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")
    
    # Encode the target sentence
    target_embedding = embed([target_sentence])[0]
    
    # Encode and compare each sentence in the list
    max_similarity = -1
    most_similar_sentence = None
    for sentence in sentence_list:
        sentence_embedding = embed([sentence])[0]
        
        # Calculate cosine similarity between the target and current sentence
        similarity = tf.keras.losses.cosine_similarity(target_embedding, sentence_embedding).numpy()
        
        if similarity > max_similarity:
            max_similarity = similarity
            most_similar_sentence = sentence
    
    # Check if the highest similarity score exceeds the threshold
    if max_similarity >= similarity_threshold:
        return most_similar_sentence
    
    return "No same meaning sentence found."

# Example usage
target = "I love Python programming."
sentences = [
    "Python programming is my passion.",
    "I enjoy doing Python programming.",
    "I hate Python programming.",
    "Python programming is not for me."
]

threshold = 0.7
result = find_same_meaning_sentence(target, sentences, threshold)
print(result)