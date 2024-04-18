import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer

# Download required NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

def preprocess_sentence(sentence):
    # Tokenize the sentence into words
    tokens = word_tokenize(sentence.lower())
    
    # Remove stop words
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [word for word in tokens if word not in stop_words]
    
    # Perform stemming
    stemmer = PorterStemmer()
    stemmed_tokens = [stemmer.stem(word) for word in filtered_tokens]
    
    return stemmed_tokens

def find_most_similar_sentence(target_sentence, sentence_list):
    # Preprocess the target sentence
    target_tokens = preprocess_sentence(target_sentence)
    
    # Create a set of unique tokens from the target sentence
    target_tokens_set = set(target_tokens)
    
    max_similarity = 0
    most_similar_sentence = None
    
    for sentence in sentence_list:
        # Preprocess the current sentence
        sentence_tokens = preprocess_sentence(sentence)
        
        # Calculate the cosine similarity
        intersection = target_tokens_set.intersection(set(sentence_tokens))
        similarity = len(intersection) / (len(target_tokens) * len(sentence_tokens)) ** 0.5
        
        # Update the most similar sentence if a higher similarity is found
        if similarity > max_similarity:
            max_similarity = similarity
            most_similar_sentence = sentence
    
    return most_similar_sentence

# Example usage
target_sentence = "The fox jumps over the dog."
sentence_list = [
    "A quick brown fox leaps over a lazy dog.",
    "The lazy cat sleeps on the couch.",
    "The quick brown fox jumps over the fence."
]

most_similar = find_most_similar_sentence(target_sentence, sentence_list)
print(f"Most similar sentence: {most_similar}")