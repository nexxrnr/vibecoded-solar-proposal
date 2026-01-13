# usage.py
import json

# sample usage json
# {"monthly_usages" : {
#     "1" : 900,
#     "2" : 900,
#     "3" : 900,
#     "4" : 900,
#     "5" : 900,
#     "6" : 900,
#     "7" : 900,
#     "8" : 900,
#     "9" : 900,
#     "10" : 900,
#     "11" : 900,
#     "12" : 900
#     },
# "bill_month" : 5,
# "higher_tariff_percent" : 0.90
# }

class Usage:
    
    def __init__(self, json=False):
        
        self.annual_usage = 0
        self.higher_tariff_percent = 0
        self.bill_month = 0
        self.monthly_usage = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0}
        
        if json != False:
            try:
                self.higher_tariff_percent = json["higher_tariff_percent"]
                
                self.bill_month = json["bill_month"]
                
                for i in range(1,13):
                    self.monthly_usage[i] = json["monthly_usages"][str(i)]
                    
                self.annual_usage = sum(self.monthly_usage)
                
            except Exception as e:
                print(f"An error occured while loading usage from json: {e}")
                return False
            
    def load_json_from_file(self, filename):
        try:
            with open(filename, 'r') as file:
                self.json_usage = json.load(file)
                
                self.higher_tariff_percent = self.json_usage["higher_tariff_percent"]
                self.bill_month = self.json_usage["bill_month"]
                    
                for i in range(1,13):
                    self.monthly_usage[i] = self.json_usage["monthly_usage"][str(i)]
                    
                self.annual_usage = sum(self.monthly_usage)   

                return True
            
        except Exception as e:
            print(f"An error occured while loading usage from json: {e}")
            return False