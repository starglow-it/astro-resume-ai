import gensim.downloader as api
from gensim.models import Word2Vec
from nltk.tokenize import word_tokenize

# Load pre-trained word embeddings
word_vectors = api.load("word2vec-google-news-300")

def sentence_similarity(target_sentence, sentence_list):
    # Tokenize and preprocess sentences
    target_tokens = word_tokenize(target_sentence.lower())
    sentence_tokens = [word_tokenize(s.lower()) for s in sentence_list]

    # Convert sentences to vectors
    target_vector = sum(word_vectors[token] for token in target_tokens) / len(target_tokens)
    sentence_vectors = [sum(word_vectors[token] for token in tokens) / len(tokens) for tokens in sentence_tokens]

    # Calculate cosine similarities
    similarities = [target_vector.dot(sv) / (target_vector.norm() * sv.norm()) for sv in sentence_vectors]

    # Rank and select sentences
    ranked_sentences = sorted(zip(sentence_list, similarities), key=lambda x: x[1], reverse=True)
    return [s for s, _ in ranked_sentences]

# Example usage
target_sentence = "The quick brown fox jumps over the lazy dog."
sentence_list = [
    "A quick brown fox leaps over a lazy dog.",
    "The lazy cat sleeps on the couch.",
    "The quick brown fox jumps over the fence."
]

similar_sentences = sentence_similarity(target_sentence, sentence_list)
print("Similar sentences:")
for sentence in similar_sentences:
    print(sentence)