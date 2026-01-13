import json
import requests


class Production:
    
    LOSS = 10 # 10%
    
    def __init__(self, layout, panel_power, lat, lon):
        
        return False
    
    def calculate_production(self, lat=44.0, lon=20.0):
        #resetting the values
        self.monthly_production = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0}
        self.annual_production = 0
        
        # construct the api call
        api_base_url = f"https://re.jrc.ec.europa.eu/api/PVcalc?loss={self.LOSS}&outputformat=json&lat={lat}&lon={lon}"
        
        for surface in self.surfaces:

            #prepare API URL
            peakpower = surface['power'] / 1000
            angle = surface['slope']
            aspect = surface['orientation']
            url = api_base_url + f"&peakpower={peakpower}&angle={angle}&aspect={aspect}"

            try:
                # API call
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()
                
            
                
                monthly_production = {}
                for item in data['outputs']['monthly']['fixed']:
                    month = item['month']
                    month_production = item['E_m']
                    monthly_production[int(month)] = month_production
                
                #add dictionary to layout total production dictionary - redundant?
                
                for i in range(1,13):
                    self.monthly_production[i] += int(monthly_production[i] * (1-surface['shading']))
                
                
                

                
            except requests.RequestException as e:
                print(f"An error while calling the API occurred: {e}")
            

        for i in range(1,13):
            self.annual_production = sum(self.monthly_production)
           
            
        return self.annual_production