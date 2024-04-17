# AutoBid Application API Documentation

## Overview

This documentation covers the endpoints provided by the `auto_bid` application, allowing clients to save and retrieve answers related to specific user profiles. The API supports operations to manage question-answer pairs efficiently with functionality to update existing data and fetch answers considering specific criteria like question text and input type.

## API Endpoints

### 1. Save Answers

**Endpoint:** `POST /api/save_answers`

**Description:**  
Allows clients to save or update answers for questions linked to a specific user profile. It can create new answers or update existing ones based on the combination of the question and its input type.

**Request Body Example:**

```json
{
  "profile_id": 1,
  "data": [
    {
      "question": "What is your favorite color?",
      "isOptional": false,
      "inputType": "text",
      "answer": "Blue"
    },
    {
      "question": "Years of experience?",
      "isOptional": false,
      "inputType": "number",
      "answer": "5"
    }
  ]
}
```

**Successful Response:**

Status Code: 201 (Created)

```json
{
  "message": "Answers successfully saved"
}
```

### 2. Get Answers

**Endpoint:** `POST /api/get_answers`

**Description:**
Retrieves answers based on the profile ID and specified questions with their input types. This ensures that answers for a given profile are fetched accurately according to both the question content and the input type.

**Request Body Example:**

```json
{
  "profile_id": 1,
  "data": [
    {
      "id": "q1",
      "question": "What is your favorite color?",
      "inputType": "text"
    },
    {
      "id": "q2",
      "question": "Years of experience?",
      "inputType": "number"
    }
  ]
}
```

**Successful Response:**

```json
{
  "message": "Answers successfully retrieved",
  "answers": {
    "q1": "Blue",
    "q2": "5"
  }
}
```

**_Notes:_**

The id field in the request for retrieving answers should uniquely identify each question, aiding in the precise mapping of responses.
The profile_id must be valid and existing in the database, failing which a 404 (Not Found) status will be returned.
For the save_answers endpoint, if an existing answer matches the given question and input type, it will be updated. If no matching entry exists, a new one will be created.
Both endpoints utilize profile_id to ensure answers are personalized and relevant to specific user profiles.
