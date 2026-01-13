# ubill.py
from decimal import *
import datetime

PERCENT_COST_INCREASE = 0.05

PERMITTED_POWER_COST_PER_UNIT = 54.258
GUARANTEED_SUPPLIER_COST = 146.521
GREEN_KWH_HIGH_COST = 8.336
GREEN_KWH_LOW_COST = 2.084
BLUE_KWH_HIGH_COST = 12.504
BLUE_KWH_LOW_COST = 3.126
RED_KWH_HIGH_COST = 25.008
RED_KWH_LOW_COST = 6.252
BENEFICIAL_SUPPLIER_SUBSIDY_FEE = 0.801
ENERGY_EFFICIENCY_FEE = 0.015
EXCISE_TAX_PERCENT = 0.075
VAT_TAX_PERCENT = 0.2
TV_TAX = 300

class Ubill:
    
    def calculateCost(self):
        #1
        obracunskaSnaga = self.permittedPower * PERMITTED_POWER_COST_PER_UNIT
        #2
        trosakGarantovanogSnabdevaca = GUARANTEED_SUPPLIER_COST
        
        #3
        greenHigherCost = self.usageGreenHigher * GREEN_KWH_HIGH_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
        greenLowerCost = self.usageGreenLower * GREEN_KWH_LOW_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
        blueHigherCost = self.usageBlueHigher * BLUE_KWH_HIGH_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
        blueLowerCost = self.usageBlueLower * BLUE_KWH_HIGH_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
        redHigherCost = self.usageRedHigher * RED_KWH_HIGH_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
        redLowerCost = self.usageRedLower * RED_KWH_LOW_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
        #4
        zaduzenjeZaElEnergiju = obracunskaSnaga + trosakGarantovanogSnabdevaca + greenHigherCost + greenLowerCost + blueHigherCost + blueLowerCost + redHigherCost + redLowerCost
        #8
        naknadaZaPodsticajPovlascenihProizvodjaca = self.usage * BENEFICIAL_SUPPLIER_SUBSIDY_FEE
        #9
        naknadaZaEnergetskuEfikasnost = self.usage * ENERGY_EFFICIENCY_FEE
        #10
        osnovicaZaAkcizu = zaduzenjeZaElEnergiju + naknadaZaPodsticajPovlascenihProizvodjaca + naknadaZaEnergetskuEfikasnost
        #11
        akciza = osnovicaZaAkcizu * EXCISE_TAX_PERCENT
        #12
        osnovicaZaPDV = osnovicaZaAkcizu + akciza
        #13
        PDV = osnovicaZaPDV * VAT_TAX_PERCENT
        #15
        ukupnoZaduzenje = osnovicaZaPDV + PDV
        #16
        
        total = ukupnoZaduzenje + TV_TAX
        
        return total

        
#        return calculatedCost
        
        
    def __init__(self, month, year, usage, higherTariffPercent=0.85, permittedPower=11.4):
        
        self.month = int(month)
        self.usage = int(usage)
        
        if year > 2000:
            self.year = int(year - datetime.datetime.now().year)
        else:
            self.year = year                
        
        self.higherTariffPercent = higherTariffPercent
        self.permittedPower = permittedPower
        
        self.usageHigherTariff = self.usage * self.higherTariffPercent
        self.usageLowerTariff = self.usage * (1 - self.higherTariffPercent)
        
        self.usageGreenHigher = 0
        self.usageGreenLower = 0
        self.usageBlueHigher = 0
        self.usageBlueLower = 0
        self.usageRedHigher = 0
        self.usageRedLower = 0
        
        if self.usage <= 350:
            self.usageGreenHigher = self.usage * self.higherTariffPercent
            self.usageGreenLower = self.usage * (1 - self.higherTariffPercent)
            
        if self.usage > 350 and self.usage <= 1600:
            #GREEN
            self.usageGreenHigher = 350 * self.higherTariffPercent
            self.usageGreenLower = 350 * (1 - self.higherTariffPercent)
            #BLUE
            self.usageBlueHigher = (self.usage - 350) * self.higherTariffPercent
            self.usageBlueLower = (self.usage - 350) * (1 - self.higherTariffPercent)
        
        if self.usage > 1600:
            #GREEN
            self.usageGreenHigher = 350 * self.higherTariffPercent
            self.usageGreenLower = 350 * (1 - self.higherTariffPercent)
            #BLUE
            self.usageBlueHigher = (1600-350) * self.higherTariffPercent
            self.usageBlueLower = (1600-350) * (1 - self.higherTariffPercent)
            #RED
            self.usageRedHigher = (self.usage - 1600) * self.higherTariffPercent
            self.usageRedLower = (self.usage - 1600) * (1 - self.higherTariffPercent)
            
        
        self.cost = int(self.calculateCost())
    
    def __str__(self):
        year = self.year + 2023
        return f"{self.month}.{year}. ubill: \nusage: {self.usage}kwh / cost: {self.cost}rsd"
    
    
    
SOLAR_HIGHER_KWH_COST = 3.879
SOLAR_LOWER_KWH_COST = 0.97
DISTRIBUTED_SYSTEM_CHARGE_PER_KWH = 3.897

class SolarBill:
    
    def calculateCost(self):
        # ok fresh and ready to dive into the hard bit!
        # what needs to happen here? all the variables have been set
        # now we simply calculate the cost & output is the cost of bill
        # getting there however is a bit more tricky. So let's dive in!
        
        obracunskaSnaga = self.permittedPower * PERMITTED_POWER_COST_PER_UNIT #1
        trosakGarantovanogSnabdevaca = GUARANTEED_SUPPLIER_COST #2
        #3
        utrosenaEnergijaZbir = (self.netGreenHigherTariff * GREEN_KWH_HIGH_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
                                + self.netGreenLowerTariff * GREEN_KWH_LOW_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
                                + self.netBlueHigherTariff * BLUE_KWH_HIGH_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
                                + self.netBlueLowerTariff * BLUE_KWH_LOW_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
                                + self.netRedHigherTariff * RED_KWH_HIGH_COST * ((1 + PERCENT_COST_INCREASE) ** self.year)
                                + self.netRedLowerTariff * RED_KWH_LOW_COST * ((1 + PERCENT_COST_INCREASE) ** self.year))
        
        naknadaZaPovlascene = self.kwhExported * BENEFICIAL_SUPPLIER_SUBSIDY_FEE #5
        naknadaZaEfikasnost = self.kwhExported * ENERGY_EFFICIENCY_FEE #6
        naknadaZaDS = (self.kwhImported - self.netHigherUsage) * DISTRIBUTED_SYSTEM_CHARGE_PER_KWH * ((1 + PERCENT_COST_INCREASE) ** self.year) #7
        #8
        osnovicaZaAkcizu = obracunskaSnaga + trosakGarantovanogSnabdevaca + utrosenaEnergijaZbir + naknadaZaPovlascene + naknadaZaEfikasnost + naknadaZaDS
        akcizaIznos = osnovicaZaAkcizu * EXCISE_TAX_PERCENT #9
        osnovicaZaPDV = osnovicaZaAkcizu + akcizaIznos #10
        PDVIznos = osnovicaZaPDV * VAT_TAX_PERCENT #11
        
        ukupnoZaduzenje = osnovicaZaPDV + PDVIznos
        
        totalCost = ukupnoZaduzenje + TV_TAX
        #DONT FORGET LT USAGE 
        return int(totalCost)

    
    def calculateExcessForNextMonth(self):
        if self.month == 3:
            return 0
        excess = self.excessFromPreviousMonth + self.production - self.usage
        if excess > 0:
            return excess
        else:
            return 0
        
    def calculateKwhOfSolarUsedOnSpot(self):
        # need to figure out a linear model here, but for now will say that
        # 40% of solar is used on the spot, regardless of production/usage ratio
        # that is up until 60% of usage is reached, then it caps at 60% of usage
        
        fortyPercentOfProduction = 0.4 * self.production
        sixtyPercentOfUsage = 0.6 * self.higherTariffUsage

        if fortyPercentOfProduction < sixtyPercentOfUsage:
            return fortyPercentOfProduction
        else:
            return sixtyPercentOfUsage
    
        
        
    def __init__(self,month, year, usage, production, excessFromPreviousMonth=0, higherTariffPercent=0.85, permittedPower=11.4):
        
        self.month = int(month)
        self.usage = int(usage)
        
        if year > 2000:
            self.year = int(year - datetime.datetime.now().year)
        else:
            self.year = year
            
        self.higherTariffPercent = higherTariffPercent
        self.lowerTariffPercent = (1 - higherTariffPercent)
        
        self.production = int(production)
        
        self.excessFromPreviousMonth = excessFromPreviousMonth
        self.permittedPower = permittedPower
        
        self.higherTariffUsage = self.higherTariffPercent * self.usage
        self.lowerTariffUsage = self.lowerTariffPercent * self.usage
        
        self.kwhOfSolarUsedOnSpot = self.calculateKwhOfSolarUsedOnSpot() #need a better model here - actually it's ok
        
        self.kwhExported = self.production - self.kwhOfSolarUsedOnSpot
        self.kwhImported = self.higherTariffUsage - self.kwhOfSolarUsedOnSpot
        
        if self.kwhImported - self.kwhExported - self.excessFromPreviousMonth < 0:
            self.netHigherUsage = 0
        else:
            self.netHigherUsage = self.kwhImported - self.kwhExported - self.excessFromPreviousMonth
            
        self.dsSurchargeKwh = self.kwhImported - self.netHigherUsage
        
        
        # next month excess
        self.excessForNextMonth = self.calculateExcessForNextMonth()
        
        self.netLowerUsage = self.lowerTariffUsage #kind of redundant, but for the sake of clarity
        
        self.netTotal = self.netHigherUsage + self.netLowerUsage
        
        if self.netHigherUsage != 0 and self.netLowerUsage != 0:
            self.netHigherTariffPercent = self.netHigherUsage / self.netTotal
            self.netLowerTariffPercent = 1 - self.netHigherTariffPercent
        else:
            if self.netHigherUsage == 0:
                self.netHigherTariffPercent = 0
                self.netLowerTariffPercent = 1
            else:
                self.netHigherTariffPercent = 1
                self.netLowerTariffPercent = 0
        
#         print(f"net higher usage = {self.netHigherUsage}, net lower usage = {self.netLowerUsage}, net total = {self.netTotal}")
#         print(f"higher tariff % = {self.netHigherTariffPercent}")
#         print(f"lower tariff % = {self.netLowerTariffPercent}")
#         
        self.netGreenHigherTariff = 0
        self.netGreenLowerTariff = 0
        self.netBlueHigherTariff = 0
        self.netBlueLowerTariff = 0
        self.netRedHigherTariff = 0
        self.netRedLowerTariff = 0
        
        if self.netTotal < 350:
            self.netGreenHigherTariff = self.netHigherUsage
            self.netGreenLowerTariff = self.netLowerUsage

        if self.netTotal >= 350 and self.netTotal < 1600:
            self.netGreenHigherTariff = 350 * self.netHigherTariffPercent
            self.netGreenLowerTariff = 350 * (1 - self.netHigherTariffPercent)
            self.netBlueHigherTariff = (self.netTotal - 350) * self.netHigherTariffPercent
            self.netBlueLowerTariff = (self.netTotal - 350) * (1 - self.netHigherTariffPercent)
        
        if self.netTotal >= 1600:
            self.netGreenHigherTariff = 350 * self.netHigherTariffPercent
            self.netGreenLowerTariff = 350 * (1 - self.netHigherTariffPercent)
            self.netBlueHigherTariff = (1600 - 350) * self.netHigherTariffPercent
            self.netBlueLowerTariff = (1600 - 350) * (1 - self.netHigherTariffPercent)
            self.netRedHigherTariff = (self.netTotal - 1600) * self.netHigherTariffPercent
            self.netRedLowerTariff = (self.netTotal - 1600) * (1 - self.netHigherTariffPercent)

        
        self.cost = int(self.calculateCost())
        
    def info(self):
        print(f"usage={self.usage}, production={self.production}, previous excess = {self.excessFromPreviousMonth}")
        print(f"kwh used on spot={self.kwhOfSolarUsedOnSpot}, exported={self.kwhExported}, imported={self.kwhImported}, net = {self.netTotal}")
        print(f"DS surcharge kwh = {self.dsSurchargeKwh}, excessForNextMonth = {self.excessForNextMonth}")
    
    def __str__(self):
        year = self.year + 2023
        return f"{self.month}.{year} Solar bill: \nusage: {self.usage}kwh, production: {self.production}kwh, excess for next mo: {self.excessForNextMonth}kwh. \nSolar bill cost: {self.cost}rsd"
    
    
    
