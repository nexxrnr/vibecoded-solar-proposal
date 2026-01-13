SERBIA_PERCENT_FROM_COAL = 0.7
SERBIA_PERCENT_FROM_HYDRO = 0.3
KG_OF_CO2_PER_KWH_COAL = 0.9 # kg / kwh
KG_OF_CO2_PER_KWH_HYDRO = 0.024 # kg / kwh
KG_OF_CO2_PER_KWH_SOLAR = 0.04 # kg / kwh
ADULT_TREE_ABSORBTION = 50 # kg / year
CO2_CAR_PER_100_KM = 13.4 # kg / 100 km
    
class CO2:
    """ Object that calculates annualized co2 reduction and tree/km equivalents. Provide annual values for usage and solar production. """

    
    def __init__(self, annual_usage: int, annual_solar_production:int):
        
        self.annual_co2_output_pre_solar = annual_usage * (SERBIA_PERCENT_FROM_COAL * KG_OF_CO2_PER_KWH_COAL)
        
        self.annual_co2_output_post_solar = (annual_usage - annual_solar_production) * SERBIA_PERCENT_FROM_COAL * KG_OF_CO2_PER_KWH_COAL
        
        self.reduction_kg = int(self.annual_co2_output_pre_solar - self.annual_co2_output_post_solar)
        self.number_of_trees_equivalent = int(self.reduction_kg / ADULT_TREE_ABSORBTION)
        self.car_kilometres_equivalent = int(self.reduction_kg / CO2_CAR_PER_100_KM) * 100