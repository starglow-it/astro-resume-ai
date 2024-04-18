from transformers import BertTokenizer, BertModel
import torch

def find_same_meaning_sentence(target_sentence, sentence_list, similarity_threshold):
    # Load the pre-trained BERT model and tokenizer
    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
    model = BertModel.from_pretrained("bert-base-uncased")
    
    # Tokenize and encode the target sentence
    target_tokens = tokenizer.tokenize(target_sentence)
    target_input = tokenizer.encode_plus(target_tokens, add_special_tokens=True, padding='max_length', max_length=512, truncation=True, return_tensors='pt')
    
    # Encode and compare each sentence in the list
    max_similarity = -1
    most_similar_sentence = None
    for sentence in sentence_list:
        sentence_tokens = tokenizer.tokenize(sentence)
        sentence_input = tokenizer.encode_plus(sentence_tokens, add_special_tokens=True, padding='max_length', max_length=512, truncation=True, return_tensors='pt')
        
        # Convert input tensors to floating point
        target_input_float = target_input['input_ids'][0].float().unsqueeze(0)
        sentence_input_float = sentence_input['input_ids'][0].float().unsqueeze(0)
        
        # Calculate cosine similarity between the target and current sentence
        similarity = torch.cosine_similarity(target_input_float, sentence_input_float).item()
        
        print(similarity)

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