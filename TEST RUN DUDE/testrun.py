import requests
import json

def main():
    
    api_key = "5d1aODQyNTo4NDYxOlhjVExtSHVjNWhsUVVDb1U"
    template_id = "cb377b23816e949c"
    
    with open('dataset.json','r') as file:
        dataset = json.load(file)
        
    json_payload = {
      "data": json.dumps(dataset) ,
      "output_file": "output.pdf",
      "export_type": "json",
      "expiration": 30,
      "template_id": template_id
    }

    response = requests.post(
        F"https://api.craftmypdf.com/v1/create",
        headers = {"X-API-KEY": F"{api_key}"},
        json = json_payload
    )
    
    pdf_creation_response = response.json()
    
    print(pdf_creation_response)
    
#     download = requests.get("https://craftmypdf-gen.s3.ap-southeast-1.amazonaws.com/60c1aa3d-4973-41b0-9efa-de748b8236a4/output.pdf?AWSAccessKeyId=AKIA6ENCBKJYLWJUD36X&Expires=1702000537&Signature=YRZqcFsPGk4vRsNlPkth84R4YSE%3D&X-Amzn-Trace-Id=Root%3D1-65727531-096a509d16efc1fe4f27b91d%3BParent%3D8e856a67a610c311%3BSampled%3D1%3BLineage%3Dc5de222e%3A0")
#     
#     with open('proposal.pdf','wb') as pdf_file:
#         pdf_file.write(download.content)
# 
#     
main()