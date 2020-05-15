#!env/bin/python
from flask import Flask
from flask import render_template, request, url_for, jsonify
import transformers
import torch
import torch.nn.functional as F
import numpy as np
import sys

app = Flask(__name__)
model, tokenizer = None, None
idx_to_token = {}

@app.route("/")
def index():
    print("hello", file=sys.stderr)
    return render_template("index.html")

@app.route("/predict", methods=["GET", "POST"])
def predict():  
    global model
    global tokenizer
    global idx_to_token

    sentence1 = request.args.get("sentence1")
    sentence2 = request.args.get("sentence2")
    
    # Tokenize both sentences
    arg_dict = tokenizer.encode_plus(text=sentence1, text_pair=sentence2,
                                     max_length=128,
                                     add_special_tokens=True,
                                     pad_to_max_length=True,
                                     return_attention_mask=True,
                                     return_tensors="pt")
    input_id = arg_dict["input_ids"]
    token_type_id = arg_dict["token_type_ids"]
    attention_mask = arg_dict["attention_mask"]
    
    # Predict output
    with torch.no_grad():
        output = model(input_id,
                       token_type_ids=token_type_id,
                       attention_mask=attention_mask)

    logits = output[0]
    prediction = logits.detach().numpy()
    softmax = F.softmax(logits, dim=1)
    values = np.sort(-softmax, axis=1) * -1
    values = values.tolist()[0][:5]
    print(values)
    prediction = np.argpartition(-prediction, 5).tolist()
    prediction = prediction[0][:5]
    print(prediction)
    
    result = [ idx_to_token[i] for i in prediction ]

    return jsonify(predictions=result, values=values)

@app.before_first_request
def init_model():
    # define global variables for model and tokenizer
    global model
    global tokenizer
    global idx_to_token
    
    # configuration = transformers.BertConfig("./model/config.json")
    model_class = transformers.BertForSequenceClassification
    tokenizer_class = transformers.BertTokenizer
    pretrained_weights = './model/'

    # load weights for tokenizer and model
    tokenizer = tokenizer_class.from_pretrained('bert-base-uncased')
    model = model_class.from_pretrained(
        pretrained_weights,
        num_labels=20,
        output_attentions=False,
        output_hidden_states=False
    )
    idx_to_token = { 
        0: "[no connective]", 1: "and", 2: "by contrast",
        3: "by then", 4: "finally", 5: "for example",
        6: "however", 7: "in other words", 8: "in particular", 
        9: "indeed", 10: "instead", 11: "meanwhile", 12: "moreover", 
        13: "nevertheless", 14: "on the other hand", 15: "otherwise", 
        16: "overall", 17: "rather", 18: "then", 19: "therefore"
    }
    model.eval()