
class CO2_calc:
    
    self.SERBIA_PERCENT_FROM_COAL = 0.7
    self.SERBIA_PERCENT_FROM_HYDRO = 0.3
    self.KG_OF_CO2_PER_KWH_COAL = 0.9 # kg / kwh
    self.KG_OF_CO2_PER_KWH_HYDRO = 0.024 # kg / kwh
    self.KG_OF_CO2_PER_KWH_SOLAR = 0.04 # kg / kwh
    self.ADULT_TREE_ABSORBTION = 50 # kg / year
    self.CO2_CAR_PER_100_KM = 13.4 # kg / 100 km
    
    def __init__(usage: int, solar_production:int):
        self.usage = usage
        self.solar_production = solar_production
        
        self.annual_co2_output_pre_solar = usage * (self.SERBIA_PERCENT_FROM_COAL * self.KG_OF_CO2_PER_KWH_COAL +
                                                    self.SERBIA_PERCENT_FROM_HYDRO * self.KG_OF_CO2_PER_KWH_HYDRO)
        if solar_production >= usage:
            self.annual_co2_output_post_solar = usage * self.KG_OF_CO2_PER_KWH_SOLAR
        else:
            self.annual_co2_output_post_solar = solar_production * self.KG_OF_CO2_PER_KWH_SOLAR +
                                                (usage - solar_production) * (self.SERBIA_PERCENT_FROM_COAL * self.KG_OF_CO2_PER_KWH_COAL +
                                                                              self.SERBIA_PERCENT_FROM_HYDRO * self.KG_OF_CO2_PER_KWH_HYDRO)
                                                
        self.co2_reduction = self.annual_co2_output_pre_solar - self.annual_co2_output_post_solar
        self.trees_equivalent = int(self.annual_co2_output_post_solar / self.ADULT_TREE_ABSORBTION)
        self.km_driven_equivalent = int(self.annual_co2_output_post_solar / self.CO2_CAR_PER_100_KM) * 100