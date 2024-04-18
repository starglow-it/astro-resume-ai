import nltk
from nltk.corpus import wordnet
from nltk.metrics import *
from nltk.tokenize import sent_tokenize

def find_same_meaning_sentence(target_sentence, sentence_list, similarity_threshold):
    target_tokens = nltk.word_tokenize(target_sentence)
    
    # Preprocess the target sentence
    target_sentence = target_sentence.lower()
    target_sentence = nltk.pos_tag(nltk.word_tokenize(target_sentence))
    
    # Compute similarity score for each sentence
    similarity_scores = []
    for sentence in sentence_list:
        sentence = sentence.lower()
        sentence = nltk.pos_tag(nltk.word_tokenize(sentence))
        
        # Calculate the similarity score using Wup similarity metric
        similarity_score = sentence_similarity(target_sentence, sentence)
        similarity_scores.append(similarity_score)

        print(similarity_score)

    # Find the sentence with the highest similarity score
    max_score_index = max(range(len(similarity_scores)), key=similarity_scores.__getitem__)
    
    # Check if the highest similarity score exceeds the threshold
    if similarity_scores[max_score_index] >= similarity_threshold:
        return sentence_list[max_score_index]
    
    return "No same meaning sentence found."

def sentence_similarity(sentence1, sentence2):
    synsets1 = get_synsets(sentence1)
    synsets2 = get_synsets(sentence2)
    
    score = 0.0
    for synset1 in synsets1:
        for synset2 in synsets2:
            similarity = synset1.wup_similarity(synset2)
            if similarity:
                score += similarity
    
    return score

def get_synsets(sentence):
    synsets = []
    for word, tag in sentence:
        if tag.startswith('NN'):
            synsets.extend(wordnet.synsets(word, pos=wordnet.NOUN))
        elif tag.startswith('VB'):
            synsets.extend(wordnet.synsets(word, pos=wordnet.VERB))
        elif tag.startswith('JJ'):
            synsets.extend(wordnet.synsets(word, pos=wordnet.ADJ))
        elif tag.startswith('RB'):
            synsets.extend(wordnet.synsets(word, pos=wordnet.ADV))
    
    return synsets

# Example usage
target = "I love Python programming."
sentences = [
    "Python programming is my passion.",
    "I enjoy doing Python programming.",
    "I hate Python programming.",
    "Python programming is not for me."
]

# List of origin questions
target = "Are you currently employed?"
    # "First Name",
    # "Are you authorized to work in the US?",
    # "What is your employment status?",
    # "Do you have legal working rights in the United States?",
    # "Are you currently employed?"


# List of input questions
sentences = [
    "Do you have a work permit for the USA?",
    "What is your job status?",
    "Are you permitted to work in America?",
    "What is your First Name?",
]


threshold = 0.7
result = find_same_meaning_sentence(target, sentences, threshold)
print(result)