#!env/bin/python
from flask import Flask
from flask import render_template, request, url_for, jsonify, Response
import transformers
import torch
import torch.nn.functional as F
import numpy as np
import gc

try:
    import googleclouddebugger
    googleclouddebugger.enable()
except ImportError:
    pass

app = Flask(__name__)

def init_model(num):    
    configuration = transformers.BertConfig("./model/config.json")
    model_class = transformers.BertForSequenceClassification
    tokenizer_class = transformers.BertTokenizer
    if num == 1:
        pretrained_weights = './model/model1/'
        idx_to_token = { 
            0: "[no connective]", 1: "and", 2: "by contrast",
            3: "by then", 4: "finally", 5: "for example",
            6: "however", 7: "in other words", 8: "in particular", 
            9: "indeed", 10: "instead", 11: "meanwhile", 12: "moreover", 
            13: "nevertheless", 14: "on the other hand", 15: "otherwise", 
            16: "overall", 17: "rather", 18: "then", 19: "therefore"
        }
    else:
        pretrained_weights = './model/model2/'
        idx_to_token = {
            0: "[no connective]", 1: "although", 2: "and",
            3: "because", 4: "but", 5: "for example", 6: "however",
            7: "or", 8: "so", 9: "so that", 10: "unless", 11: "while"
        }
    pretrained_tokenizer = './tokenizer'

    # load weights for tokenizer and model
    tokenizer = tokenizer_class.from_pretrained(pretrained_tokenizer)
    model = model_class.from_pretrained(
        pretrained_weights,
    )

    model.eval()
    return model, tokenizer, idx_to_token

# model, tokenizer, idx_to_token = init_model()

@app.route("/")
def index():
    return render_template("content/model.html")

@app.route("/model", methods=["GET"])
def model():
    model_num = request.args.get("modelNum")

    # free up some memory
    if hasattr(app, "model"):
        del app.model
    if hasattr(app, "tokenizer"):
        del app.tokenizer
    if hasattr(app, "idx_to_token"):
        del app.idx_to_token
    gc.collect()
    # init models
    if model_num == "1":
        app.model, app.tokenizer, app.idx_to_token = init_model(1)
        examples = [("Hebden Bridge is a popular place to live.",
                     "Space is limited due to the steep valleys and lack of flat land."),
                    ("As a consequence, three ministers resigned.",
                     "Prime Minister Horn won the majority of the Socialists behind himself."),
                    ("In 1997, the College again made a name change to Petit Jean College.",
                     "In 2001, Petit Jean College merged with the University of Arkansas System and became the College at Morrilton.")
                   ]
    elif model_num == "2":
        app.model, app.tokenizer, app.idx_to_token = init_model(2)
        examples = [("Of the three colors orange, yellow, and purple, we prefer purple.",
                     "Purple reinforces the red."),
                    ("Many residents speak Hindi, French, or Spanish.",
                     "Others have a primary language of English."),
                    ("Tropical cyclones are particularly a problem in Asia.",
                     "In 2008, Cyclone Nargis damaged 122,782 hectares of deepwater rice in Burma.")]
    else:
        return Response(status=400)

    response = jsonify(success=True, 
                       connectives=list(app.idx_to_token.values()),
                       examples=examples)
    return response

@app.route("/predict", methods=["GET"])
def predict():
    sentence1 = request.args.get("sentence1").strip()
    sentence2 = request.args.get("sentence2").strip()

    # Tokenize both sentences
    arg_dict = app.tokenizer.encode_plus(text=sentence1, text_pair=sentence2,
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
        output = app.model(input_id,
                           token_type_ids=token_type_id,
                           attention_mask=attention_mask)

    logits = output[0]
    prediction = logits.detach().numpy().flatten()
    softmax = F.softmax(logits, dim=1).detach().numpy().flatten()
    values = np.sort(-softmax) * -1
    values = values.tolist()[:5]
    prediction = (-prediction).argsort()
    prediction = prediction[:5]
    
    result = [ app.idx_to_token[i] for i in prediction ]

    return jsonify(predictions=result, values=values)