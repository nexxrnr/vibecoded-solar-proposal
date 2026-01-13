# layout.py (includes surfaces as a dictionary

import json
import requests
import time

class Layout:

    # surface required keys
    REQUIRED_KEYS = {'power', 'slope', 'orientation', 'shading', 'name'}
    
    def __init__(self):
        self.surfaces = []  # A list to store surfaces
        self.total_power = 0
        self.monthly_production = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0}
        self.annual_production = 0

    def add_surface(self, surface):
        if self.validate_surface(surface):
            self.surfaces.append(surface)    
            self.total_power += int(surface['power'])
            return True
        else:
            raise ValueError("Invalid surface data")
            return False
    
    def save_as_json(self, filename):
        layout_data = {
            "total_power": self.total_power,
            "production": self.production,
            "surfaces": self.surfaces
        }
        # Write the data to a JSON file
        try:
            with open(filename, 'w') as file:
                json.dump(layout_data, file, indent=4)
            return True
        except Exception as e:
            print(f"An error occurred: {e}")
            return False
        
    def load_from_json(self, filename):
        try:
            with open(filename, 'r') as file:
                self.json_layout = json.load(file)
                for surface in self.json_layout["surfaces"]:
                    self.add_surface(surface)
                return True
            
        except Exception as e:
            print(f"An error occured while loading surface from json: {e}")
            return False
    
    def validate_surface(self, surface):
        if not self.REQUIRED_KEYS.issubset(surface.keys()):
            return False
        
        if not surface['power'] >= 0:
            return False
        
        if not -180 <= surface['orientation'] <= 180:
            return False
        
        if not 0 <= surface['slope'] <= 90:
            return False
        
        if not 0 <= surface['shading'] <= 1:
            return False
        
        return True
    
    def __str__(self):
        return f"total power = {self.total_power}, surfaces: " + str(self.surfaces)
    
    def calculate_production(self, lat=44.0, lon=20.0):
        #resetting the values
        self.monthly_production = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0}
        self.annual_production = 0
        
        # construct the api call
        self.lat = lat
        self.lon = lon
        
        api_base_url = "https://re.jrc.ec.europa.eu/api/PVcalc?loss=10&outputformat=json" + f"&lat={self.lat}&lon={self.lon}"
        
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
# 
# # sample usage
# def main():
#     layout = Layout()
#     layout.add_surface({'name': 'test surface', 'power': 6000, 'orientation': 0, 'slope': 33, 'shading': 0.1})
#     print(layout.surfaces)
# 
# main()
