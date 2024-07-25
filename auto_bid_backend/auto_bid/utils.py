from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
from .models import Question, StandardQuestion

def get_similar_question(question):
    standard_questions = StandardQuestion.objects.all().values_list('standard_question', flat=True)
    similar_question = find_similar_sentence(question, list(standard_questions), score_threshold=0.7)
    standard_question = None
    
    if similar_question:
        standard_question = StandardQuestion.objects.get(standard_question=similar_question)
    
    return standard_question if standard_question else None

def get_standard_question(question_text):
    # Try to get the question from the StandardQuestion
    try:
        standard_question = StandardQuestion.objects.get(standard_question=question_text)
        
        return standard_question
    except StandardQuestion.MultipleObjectsReturned:
        standard_question = StandardQuestion.objects.filter(standard_question=question_text).first()
        return standard_question
    
    except StandardQuestion.DoesNotExist:
        # If the question does not exist, standardize and add to DB
        standard_question = StandardQuestion.objects.create(standard_question=question_text)
        Question.objects.create(question=question_text, standard_question=standard_question)
        
        return standard_question
    
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

def auto_answer_generation_model(question, resume, threshold=0.5):
    model_name = "deepset/roberta-base-squad2"
    model = AutoModelForQuestionAnswering.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    qa_pipeline = pipeline("question-answering", model=model, tokenizer=tokenizer)
    result = qa_pipeline(question=question, context=resume)
    if result['score'] < threshold:
        return False
    print(result['answer'])
    return result['answer']