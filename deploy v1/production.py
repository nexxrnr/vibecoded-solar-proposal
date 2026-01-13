import requests

      
LOSS = 14 # 10%

class Production:
    """Object that calculates annual and monthly productions of a certain solar system."""

    def __init__(self, layout: list, panel_power: int, coordinates: dict):
        """
        Initialize a Production object by calling an re.jrc.ec.eu PVCalc API.

        Args:
            layout (list): An array of surfaces (dictionaries) where each surface has the following keys:
                - 'number_of_panels' (int)
                - 'orientation' (int): 0 represents South, (-)180 represents North
                - 'slope' (int)
                - 'shading' (float)
            panel_power (int)
            coordinates (dict): A dictionary with 'lat' (float) and 'lon' (float) values
        """

        self.month = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0}
        """dictionary of monthly production values. keys are integers 1-12"""
        self.annual = 0
        """ total annual production """
        
        try:
            # construct the api call
            api_base_url = f"https://re.jrc.ec.europa.eu/api/PVcalc?loss={LOSS}&outputformat=json&lat={coordinates['lat']}&lon={coordinates['lon']}"
            
            for surface in layout:

                #prepare API URL
                peakpower = panel_power * int(surface['number_of_panels']) / 1000
                angle = surface['slope']
                aspect = surface['orientation']
                url = api_base_url + f"&peakpower={peakpower}&angle={angle}&aspect={aspect}"
                
                # API call
                response = requests.get(url)
                
                # if there's an issue, raise an error
                response.raise_for_status()
                
                
                data = response.json()
                
                for item in data['outputs']['monthly']['fixed']:
                    
                    this_month = int(item['month'])
                    
                    this_month_production = int(item['E_m']) * (1 - surface['shading'])
                    
                    self.month[this_month] += this_month_production

            self.annual = int(sum(self.month.values()))
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Production API call failed: {e}")

        except Exception as e:
            raise Exception(f"An error occurred while instantiating Production object: {e}")
    